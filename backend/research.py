"""R2.1: grounded research - GDELT/Wikipedia/HN JSON + page fetch + SSRF guard."""
import re
import json
import time
import ipaddress
import socket
import urllib.parse
import urllib.request

_TRIG = re.compile(
    r"\b(news|latest|today|current|price|score|who won|release|update|"
    r"look up|research|according to|2024|2025|2026)\b", re.I)
_TAG = re.compile(r"<[^>]+>")
_UA = {"User-Agent": "Mozilla/5.0 (compatible; AlfredResearch/2.1)"}
_MAXPAGE = 250000
_FETCHN = 2
_FTIMEOUT = 7

def _host_ok(host):
    try:
        for inf in socket.getaddrinfo(host, None):
            ip = ipaddress.ip_address(inf[4][0])
            if (ip.is_private or ip.is_loopback or ip.is_link_local
                    or ip.is_reserved or ip.is_multicast or ip.is_unspecified):
                return False
        return True
    except Exception:
        return False

class _Redir(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        try:
            u = urllib.parse.urlparse(newurl)
            if u.scheme not in ("http", "https") or not _host_ok(u.hostname):
                return None
        except Exception:
            return None
        return urllib.request.HTTPRedirectHandler.redirect_request(
            self, req, fp, code, msg, headers, newurl)

_OP = urllib.request.build_opener(_Redir)

def _text(html):
    try:
        html = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", html)
        t = _TAG.sub(" ", html).replace("&nbsp;", " ").replace("&amp;", "&")
        return re.sub(r"\s+", " ", t).strip()
    except Exception:
        return ""

def _pick(txt, query, cap=340):
    words = list(dict.fromkeys(w.lower() for w in re.findall(r"[a-z]{4,}", query)))[:12]
    best, bs = "", 0
    for i in range(0, min(len(txt), 12000), 220):
        ch = txt[i:i + cap + 80].lower()
        s = sum(1 for w in words if w in ch)
        if s > bs:
            bs, best = s, txt[i:i + cap + 80]
    return best[:cap].strip() if bs >= 2 else ""

def _fetch(url, query):
    try:
        u = urllib.parse.urlparse(url)
        if u.scheme not in ("http", "https") or not _host_ok(u.hostname):
            return None
        rq = urllib.request.Request(url, headers=_UA)
        with _OP.open(rq, timeout=_FTIMEOUT) as r:
            final = urllib.parse.urlparse(r.geturl())
            if final.scheme not in ("http", "https") or not _host_ok(final.hostname):
                return None
            html = r.read(_MAXPAGE).decode("utf-8", "replace")
        txt = _text(html)
        if len(txt) < 120:
            return None
        return {"url": r.geturl(), "excerpt": _pick(txt, query)}
    except Exception:
        return None

def _get_json(url, timeout):
    rq = urllib.request.Request(url, headers=_UA)
    with urllib.request.urlopen(rq, timeout=timeout) as r:
        return json.loads(r.read(_MAXPAGE).decode("utf-8", "replace"))

def _dedupe(recs):
    seen, out = set(), []
    for r in recs:
        if r["url"] not in seen:
            seen.add(r["url"]); out.append(r)
    return out

def _gdelt(q):
    u = ("https://api.gdeltproject.org/api/v2/doc/doc?query="
         + urllib.parse.quote(q[:120]) + "&mode=artlist&format=json&maxrecords=8")
    d = _get_json(u, 9)
    out = []
    for a in (d.get("articles") or []):
        t = (a.get("title") or "").strip(); au = (a.get("url") or "").strip()
        if t and au.startswith("http"):
            sd = a.get("seendate") or ""
            date = (sd[:4] + "-" + sd[4:6] + "-" + sd[6:8]) if len(sd) >= 8 and sd[:8].isdigit() else ""
            out.append({"title": t[:120], "url": au, "date": date,
                        "snippet": (a.get("domain") or "")[:100], "src": "gdelt"})
    return out

def _wiki(q):
    u = ("https://en.wikipedia.org/w/rest.php/v1/search/page?q="
         + urllib.parse.quote(q[:120]) + "&limit=5")
    d = _get_json(u, 8)
    out = []
    for p in (d.get("pages") or []):
        k = p.get("key") or ""; t = (p.get("title") or "").strip()
        ex = _TAG.sub("", p.get("excerpt") or "")
        if t and k:
            out.append({"title": t, "date": "",
                        "url": "https://en.wikipedia.org/wiki/" + urllib.parse.quote(k.replace(" ", "_")),
                        "snippet": ex[:180], "src": "wiki"})
    return out

def _hn(q):
    u = ("https://hn.algolia.com/api/v1/search?query="
         + urllib.parse.quote(q[:120]) + "&tags=story&hitsPerPage=5")
    d = _get_json(u, 8)
    out = []
    for h in (d.get("hits") or []):
        t = (h.get("title") or "").strip()
        au = h.get("url") or ("https://news.ycombinator.com/item?id=" + str(h.get("objectID", "")))
        if t and au.startswith("http"):
            out.append({"title": t[:120], "url": au, "date": (h.get("created_at") or "")[:10],
                        "snippet": "HN discussion" + (", %s pts" % h.get("points") if h.get("points") else ""),
                        "src": "hn"})
    return out

_BACKS = {"gdelt": _gdelt, "wiki": _wiki, "hn": _hn}
_CB = {}

def _route(q):
    ql = q.lower()
    if re.search(r"\b(news|latest|today|current|breaking|price|score|won|release|update)\b", ql):
        return ["gdelt", "wiki", "hn"]
    if re.search(r"\b(code|coding|programming|python|javascript|rust|framework|library|api|software|dev)\b", ql):
        return ["hn", "wiki", "gdelt"]
    return ["wiki", "gdelt", "hn"]

def web_research2(q):
    """(block, srcs) - JSON backends + page grounding + honest labels. Never raises."""
    try:
        if not q:
            return ("", [])
        ql = q.lower()
        trig = ql.startswith("/search ") or _TRIG.search(ql)
        if not trig:
            return ("", [])
        query = q[8:].strip() if ql.startswith("/search ") else q
        recs, used = [], "?"
        for name in _route(query):
            _st = _CB.get(name) or {"n": 0, "t": 0.0}
            if _st["n"] >= 3 and (time.time() - _st["t"]) < 600:
                continue
            try:
                r = _BACKS[name](query)
                _CB[name] = {"n": 0, "t": _st["t"]}
            except Exception as e:
                _CB[name] = {"n": _st["n"] + 1, "t": time.time()}
                print("research backend %s failed: %s" % (name, str(e)[:60]), flush=True)
                r = []
            if r:
                recs, used = r, name
                break
        recs = _dedupe(recs)
        if not recs:
            print("web research2: 0 results", flush=True)
            return ("", [])
        pages = []
        for rec in recs[:_FETCHN]:
            p = _fetch(rec["url"], query)
            if p and p.get("excerpt"):
                pages.append((rec, p))
        lines = []
        for i, rec in enumerate(recs, 1):
            line = "[%d] %s: %s" % (i, rec["src"].upper(), rec["title"])
            if rec.get("date"):
                line += " (" + rec["date"] + ")"
            if rec.get("snippet"):
                line += " - " + rec["snippet"]
            lines.append(line)
        for rec, p in pages:
            lines.append("")
            lines.append("PAGE CONTENT (verified fetch) %s: %s" % (p["url"][:90], p["excerpt"]))
        fetched = dict((r["url"], p["url"]) for r, p in pages)
        srcs = []
        for rec in recs:
            u = fetched.get(rec["url"], rec["url"])
            if u.startswith("http") and u not in srcs:
                srcs.append(u)
            if len(srcs) >= 4:
                break
        block = ("\nFRESH WEB RESULTS (labelled by source; snippets are search metadata, "
                 "NOT verified page content - only PAGE CONTENT lines are; cite as [1],[2]; "
                 "never present background as breaking news):\n" + "\n".join(lines) + "\n")
        print("web research2[%s]: %d results, %d pages fetched" % (used, len(recs), len(pages)), flush=True)
        return (block, srcs)
    except Exception as e:
        print("web research skipped: %s" % str(e)[:60], flush=True)
        return ("", [])

def web_research(q):
    b, _s = web_research2(q)
    return b
