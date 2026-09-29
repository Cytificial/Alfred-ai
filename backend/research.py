"""v325: keyless web research for Alfred's brain (DuckDuckGo lite)."""
import re
import urllib.parse
import urllib.request

_TRIG = re.compile(
    r"\b(news|latest|today|current|price|score|who won|release|update|"
    r"look up|research|according to|2024|2025|2026)\b", re.I)


def web_research(q):
    """Returns a research block for the system prompt, or '' (never raises)."""
    try:
        if not q:
            return ""
        trig = q.lower().startswith("/search ") or _TRIG.search(q)
        if not trig:
            return ""
        query = q[8:].strip() if q.lower().startswith("/search ") else q
        u = "https://lite.duckduckgo.com/lite/?q=" + urllib.parse.quote(query[:200])
        rq = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(rq, timeout=9) as r:
            html = r.read().decode("utf-8", "replace")
        links = re.findall(r'<a[^>]*class=.result-link.[^>]*>(.*?)</a>', html, re.S)[:6]
        snips = re.findall(r'class=.result-snippet.[^>]*>(.*?)</td>', html, re.S)[:6]
        tag = re.compile(r"<[^>]+>")
        out = []
        for k in range(max(len(links), len(snips))):
            t = tag.sub("", links[k]).strip() if k < len(links) else ""
            sn = tag.sub("", snips[k]).strip() if k < len(snips) else ""
            if t:
                out.append("- " + t[:120] + (": " + sn[:180] if sn else ""))
        print("web research: %d results" % len(out), flush=True)
        if not out:
            return ""
        return ("\nFRESH WEB RESULTS (may be incomplete - verify before stating "
                "as fact; say plainly when unsure):\n" + "\n".join(out[:5]) + "\n")
    except Exception as e:
        print("web research skipped: %s" % str(e)[:60], flush=True)
        return ""


def web_research2(q):
    """v333: research block + per-request source URLs (never raises)."""
    try:
        import re as _re
        import urllib.parse as _up
        import urllib.request as _ur
        if not q:
            return ("", [])
        ql = q.lower()
        trig = ql.startswith("/search ") or _re.search(
            r"\b(news|latest|today|current|price|score|who won|release|update|look up|research|according to|2024|2025|2026)\b", ql)
        if not trig:
            return ("", [])
        query = q[8:].strip() if ql.startswith("/search ") else q
        u = "https://lite.duckduckgo.com/lite/?q=" + _up.quote(query[:200])
        rq = _ur.Request(u, headers={"User-Agent": "Mozilla/5.0"})
        with _ur.urlopen(rq, timeout=9) as r:
            html = r.read().decode("utf-8", "replace")
        pairs = _re.findall(r'<a[^>]*class=.result-link.[^>]*href="([^"]*)"[^>]*>(.*?)</a>', html, re.S)[:6]
        snips = _re.findall(r'class=.result-snippet.[^>]*>(.*?)</td>', html, re.S)[:6]
        tag = _re.compile(r"<[^>]+>")
        out, srcs = [], []
        for k in range(max(len(pairs), len(snips))):
            h = pairs[k][0] if k < len(pairs) else ""
            t = tag.sub("", pairs[k][1]).strip() if k < len(pairs) else ""
            sn = tag.sub("", snips[k]).strip() if k < len(snips) else ""
            if t:
                out.append("- " + t[:120] + (": " + sn[:180] if sn else ""))
            if h:
                if "uddg=" in h:
                    try: h = _up.unquote(h.split("uddg=")[1].split("&")[0])
                    except Exception: pass
                if h.startswith("//"): h = "https:" + h
                if h.startswith("http") and h not in srcs: srcs.append(h)
        print("web research: %d results" % len(out), flush=True)
        if not out:
            return ("", [])
        block = ("\nFRESH WEB RESULTS (may be incomplete - verify before stating as fact):\n"
                 + "\n".join(out)
                 + "\nUse these results if relevant; if unsure, say what is uncertain.")
        return (block, srcs[:4])
    except Exception:
        return ("", [])
