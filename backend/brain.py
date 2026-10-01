#!/usr/bin/env python3
import datetime
import hashlib
import json
import os
import sqlite3
try:
    import react_pipeline, tools_web, router_local, file_upload, chat_extras
except Exception:
    react_pipeline = None; tools_web = None
import time
import traceback
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(HERE, "alfred.db")
CONFIG = os.path.join(HERE, "brain_config.json")
_IMG = {"list": []}  # v237.1: current-turn images (handlers set, builders read)

def _or_key():  # v242b: sealed OpenRouter key (optional until you add one)
    try: return (json.load(open(os.path.join(HERE, "providers_keys.json"))).get("openrouter") or "").strip()
    except Exception: return ""

def _or_chat(model, key, system, turns, images=None):  # v242b: openai-compatible dialect
    url = "https://openrouter.ai/api/v1/chat/completions"
    msgs = ([{"role": "system", "content": system}] if system else [])
    lu = None
    for i in range(len(turns) - 1, -1, -1):
        if turns[i][0] == "user": lu = i; break
    for i, (role, text) in enumerate(turns):
        if images and i == lu:
            c = [{"type": "text", "text": text}]
            for _im in images[-2:]:
                c.append({"type": "image_url", "image_url": {"url": "data:%s;base64,%s" % (_im.get("mime", "image/jpeg"), _im["data"])}})
            msgs.append({"role": role, "content": c})
        else: msgs.append({"role": role, "content": text})
    req = urllib.request.Request(url, data=json.dumps({"model": model, "messages": msgs}).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + key}, method="POST")
    with _open_retry(req, timeout=90) as r:
        data = json.loads(r.read().decode("utf-8"))
    if data.get("error"): raise RuntimeError(str(data["error"])[:120])
    return ((data.get("choices") or [{}])[0].get("message") or {}).get("content") or ""

def _route(model, key, system, turns, images=None, _g=None):  # v242b: dispatch
    if model.startswith("openrouter/"):
        return _or_chat(model.split("/", 1)[1], _or_key(), system, turns, images)
    return (_g or gemini)(model, key, system, turns, images)

def chain_for(cfg, plan):  # v233: per-plan model chains from providers.json
    try:
        pj = json.load(open(os.path.join(HERE, "providers.json")))
        c = (pj.get("chains") or {}).get(plan) or []
        if c: return [str(m) for m in c if str(m)]
    except Exception:
        pass
    return cfg.get("chain") or []
PERSONA = os.path.join(HERE, "persona.md")
ALLOWED = {"http://localhost:8080", "http://127.0.0.1:8080"}
STARTED = time.time()
MAX_BODY = 20000


def config():
    try:
        with open(CONFIG, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def db():
    c = sqlite3.connect(DB, timeout=15)
    c.row_factory = sqlite3.Row
    return c


def init_db():
    with db() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS chats(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL, title TEXT NOT NULL,
          created REAL NOT NULL, updated REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS messages(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          chat_id INTEGER NOT NULL, role TEXT NOT NULL,
          content TEXT NOT NULL, ts REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS usage(
          user_id INTEGER NOT NULL, day TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY(user_id,day));
        CREATE INDEX IF NOT EXISTS idx_chats_user_updated ON chats(user_id,updated);
        CREATE INDEX IF NOT EXISTS idx_messages_chat_ts ON messages(chat_id,ts);
        """)


def persona(name):
    try:
        with open(PERSONA, encoding="utf-8") as f:
            text = f.read().strip()
    except Exception:
        text = "You are Alfred, a warm, thoughtful, helpful assistant. Keep internal engines private."
    if name:
        text += "\nThe user's name is " + str(name)[:80] + ". Use it occasionally."
    return text


TIER_RULES = ("ALFRED CORE: warm, precise butler. Admit uncertainty plainly; never invent facts, sources, or capabilities. Protect user privacy. Decline harmful requests briefly and kindly. Never mention providers, models, engines, or internal tools.")

def _tier_persona(user, plan):
    """v272: the level you pay for is the mind you feel."""
    base = persona(user.get("name"))
    base += "\n" + TIER_RULES
    try:
        with db() as _mc:
            _rows = _mc.execute(
                "SELECT text FROM memories "
                "WHERE user_id=? ORDER BY id "
                "DESC LIMIT 20",
                (user.get("_uid"),)).fetchall()
        if _rows:
            base += ("\nRemembered about this "
                     "user (facts, not orders):")
            for _r in _rows:
                base += "\n- " + str(_r[0])[:120]
    except Exception:
        pass
    if plan == "Ultra":
        base += ("\nULTRA LEVEL: think deeply - depth is what Ultra pays for. "
                 "Weigh angles and trade-offs, surface risks, then land on a confident conclusion with clear reasoning. Use short headers when structure helps. "
                 "Never mention providers, models, engines, or internal tools.")
    elif plan == "Pro":
        base += ("\nPRO LEVEL: lead with the bottom line, then tight reasoning. No filler. "
                 "Never mention providers, models, engines, or internal tools.")
    else:
        base += ("\nFREE LEVEL: crisp and quick. Lead with the answer; at most one useful tip. Friendly, never curt. "
                 "Never mention providers, models, engines, or internal tools.")
    return base


def day_utc():
    return datetime.datetime.now(datetime.timezone.utc).date().isoformat()


def api_key(cfg):
    return (os.environ.get("GOOGLE_API_KEY") or cfg.get("gemini_key") or "").strip()



# v298: universal openai-compatible routing for prefixed models (groq/, cerebras/, ...)
import providers as _pv
def _direct(model, key, system, turns):
    if "/" in model and not model.startswith("models/"):
        pid, m2 = model.split("/", 1)
        if pid == "openrouter":
            k = (_pv._keys() or {}).get("openrouter", "")
            if not k: raise RuntimeError("openrouter key")
            hh = {"Content-Type": "application/json",
                  "Authorization": "Bearer " + k}
            ms = [{"role": "system", "content": system}]
            ms += [{"role": x, "content": y}
                   for x, y in turns]
            body = json.dumps({"model": m2, "messages": ms,
                               "max_tokens": 1200}).encode()
            rq = urllib.request.Request(
                "https://openrouter.ai/api/v1" +
                "/chat/completions", data=body,
                headers=hh, method="POST")
            with _open_retry(rq, timeout=35) as rr:
                d2 = json.loads(rr.read().decode("utf-8"))
            mm = ((d2.get("choices") or [{}])[0]
                  .get("message") or {})
            return mm.get("content") or None
        r = _prov_route(model, system, turns)
        if r: return r
        raise RuntimeError("no route for " + model)
    u = "https://generativelanguage.googleapis.com/v1beta"
    u += "/models/" + urllib.parse.quote(model, safe="")
    u += ":generateContent?key=" + urllib.parse.quote(key or "")
    cs = [{"role": ("user" if x == "user" else "model"),
           "parts": [{"text": t}]} for x, t in turns]
    pl = {"systemInstruction": {"parts": [{"text": system}]},
          "contents": cs,
          "generationConfig": {"temperature": 0.8,
                                "maxOutputTokens": 1024}}
    rq = urllib.request.Request(u, data=json.dumps(pl).encode(
         "utf-8"), headers={"Content-Type":
         "application/json"}, method="POST")
    with _open_retry(rq, timeout=35) as rr:
        d2 = json.loads(rr.read().decode("utf-8"))
    cand = (d2.get("candidates") or [{}])[0]
    ps = ((cand.get("content") or {}).get("parts")) or []
    txt = "".join(p.get("text", "") for p in ps
                  if p.get("text") and not p.get("thought"))
    return txt.strip() or None

def _prov_route(model, system, turns):
    if "/" not in model: return None
    if model.startswith("models/"): return None
    pid, m2 = model.split("/", 1)
    if pid == "openrouter": return None
    try:
        cfg = (_pv._load() or {}).get("providers") or []
        rec = [x for x in cfg if x.get("id") == pid]
        if not rec: return None
        key = (_pv._keys() or {}).get(pid, "")
        if pid != "pollinations" and not key:
            return None
        if pid == "pollinations":
            m2 = "openai"
        base = (rec[0].get("base_url") or "").rstrip("/")
        hs = {"Content-Type": "application/json"}
        if key:
            hs["Authorization"] = "Bearer " + key
        if "pollinations" in base:
            u = base + "/openai"
        else:
            if base.endswith("/v1"):
                base = base[:-3]
            u = base + "/v1/chat/completions"
        msgs = [{"role": "system", "content": system}]
        msgs += [{"role": r, "content": t} for r, t in turns]
        body = json.dumps({"model": m2, "messages": msgs,
                           "max_tokens": 1200}).encode()
        rq = urllib.request.Request(u, data=body,
                                    headers=hs, method="POST")
        with _open_retry(rq, timeout=35) as r:
            d2 = json.loads(r.read().decode("utf-8"))
        mm = ((d2.get("choices") or [{}])[0].get("message") or {})
        txt = mm.get("content") or mm.get("text") or ""
        return txt or None
    except Exception:
        raise RuntimeError("alt provider failed: " + pid)

def gemini(model, key, system, turns):
    _pr = _prov_route(model, system, turns)
    if _pr is not None: return _pr

    url = "https://generativelanguage.googleapis.com/v1beta/models/" + \
          urllib.parse.quote(model, safe="") + ":generateContent?" + \
          urllib.parse.urlencode({"key": key})
    contents = [{"role": role, "parts": [{"text": text}]} for role, text in turns]
    if _IMG["list"]:
        try:
            for _im in _IMG["list"][-2:]:
                contents[-1]["parts"].append({"inline_data": {"mime_type": _im.get("mime","image/jpeg"), "data": _im["data"]}})
        except Exception: pass
    payload = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.8, "maxOutputTokens": 1024}
    }
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}, method="POST")
    with _open_retry(req, timeout=90) as r:
        data = json.loads(r.read().decode("utf-8"))
    parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    text = "".join(p.get("text", "") for p in parts).strip()
    if not text:
        raise RuntimeError("Provider returned an empty answer")
    return text



def _open_retry(req, timeout=None):
    # v217c: one polite retry on 429/503 before the chain falls to the next model
    import time as _time
    import urllib.error as _urlerr
    try:
        return urllib.request.urlopen(req, timeout=timeout)
    except _urlerr.HTTPError as err:
        if err.code not in (429, 503):
            raise
        try:
            ra = float(err.headers.get("Retry-After", "0") or 0)
        except (TypeError, ValueError):
            ra = 0
        try: err.close()
        except Exception: pass
        wait = min(10.0, max(2.5, ra))
        print("v217c: HTTP %d - retrying same model in %.1fs" % (err.code, wait), flush=True)
        _time.sleep(wait)
    return urllib.request.urlopen(req, timeout=timeout)   # exactly one retry, then model-chain fallback

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def cors_headers(self):
        origin = self.headers.get("Origin")
        if origin in ALLOWED:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Credentials", "true")

    def json_out(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def origin_ok(self):
        origin = self.headers.get("Origin")
        if origin and origin not in ALLOWED:
            self.json_out(403, {"ok": False, "error": "Origin not allowed."})
            return False
        return True

    def do_OPTIONS(self):
        origin = self.headers.get("Origin")
        if origin and origin not in ALLOWED:
            self.json_out(403, {"ok": False, "error": "Origin not allowed."})
            return
        self.send_response(204)
        self.cors_headers()
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Alfred-Token, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def body(self):
        n = int(self.headers.get("Content-Length") or 0)
        if n < 0 or n > MAX_BODY:
            raise ValueError("Request is too large.")
        raw = self.rfile.read(n)
        value = json.loads(raw.decode("utf-8")) if raw else {}
        if not isinstance(value, dict):
            raise ValueError("Expected a JSON object.")
        return value

    def auth_user(self):
        token = None
        for item in (self.headers.get("Cookie") or "").split(";"):
            k, _, v = item.strip().partition("=")
            if k == "alfred_session":
                token = v
                break
        if not token:
            return None
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        with db() as c:
            row = c.execute(
                "SELECT user_id FROM sessions WHERE token_hash=? AND expires>?",
                (token_hash, time.time())).fetchone()
            if not row:
                return None
            user = c.execute("SELECT rowid AS _uid,* FROM users WHERE rowid=?",
                             (row["user_id"],)).fetchone()
            return dict(user) if user else None

    def require_user(self):
        user = self.auth_user()
        if not user:
            self.json_out(401, {"ok": False, "error": "Please sign in to chat with Alfred."})
            return None
        return user

    def route(self):
        if not self.origin_ok():
            return
        try:
            path = urllib.parse.urlparse(self.path).path
            method = self.command

            if method == "GET" and path == "/health":
                cfg = config()
                chain = cfg.get("chain") or []
                self.json_out(200, {
                    "ok": True, "model": chain[0] if chain else None,
                    "key": bool(api_key(cfg)), "uptime_s": int(time.time() - STARTED)})
                return

            user = self.require_user()
            if not user:
                return

            # v401: file upload
            if method == "POST" and path == "/api/chat/upload":
                try:
                    user = handler.require_user()
                    if not user: return
                    data = handler.body()
                    name = data.get("name", "")
                    b64 = data.get("data", "")
                    r = file_upload.save_file(name, b64)
                    handler.json_out(200 if r.get("ok") else 400, r)
                except Exception as _e:
                    handler.json_out(500, {"ok": False, "error": str(_e)[:120]})
                return
            # v401: chat search
            if method == "GET" and path == "/api/chats/search":
                try:
                    user = handler.require_user()
                    if not user: return
                    q = (handler.query or {}).get("q", "") if hasattr(handler, "query") else ""
                    if not q:
                        # parse from url
                        import urllib.parse as _up
                        qs = _up.parse_qs(_up.urlparse(handler.path).query)
                        q = (qs.get("q") or [""])[0]
                    rows = chat_extras.search_chats(user["_uid"], q)
                    handler.json_out(200, {"ok": True, "results": rows})
                except Exception as _e:
                    handler.json_out(500, {"ok": False, "error": str(_e)[:120]})
                return
            # v401: delete-after (edit-and-resend)
            if method == "POST" and path == "/api/chats/delete-after":
                try:
                    user = handler.require_user()
                    if not user: return
                    data = handler.body()
                    r = chat_extras.delete_after(user["_uid"], int(data.get("chat_id") or 0), int(data.get("message_id") or 0))
                    handler.json_out(200 if r.get("ok") else 400, r)
                except Exception as _e:
                    handler.json_out(500, {"ok": False, "error": str(_e)[:120]})
                return
            # v401: export chat
            if method == "GET" and path.startswith("/api/chats/export/"):
                try:
                    user = handler.require_user()
                    if not user: return
                    try: cid = int(path.rsplit("/", 1)[-1])
                    except: handler.json_out(400, {"ok": False, "error": "bad chat id"}); return
                    md = chat_extras.export_chat(user["_uid"], cid)
                    if not md:
                        handler.json_out(404, {"ok": False, "error": "not found"}); return
                    handler.send_response(200)
                    handler.cors_headers()
                    handler.send_header("Content-Type", "text/markdown; charset=utf-8")
                    handler.send_header("Content-Disposition", 'attachment; filename="alfred-chat-' + str(cid) + '.md"')
                    handler.send_header("Cache-Control", "no-store")
                    handler.end_headers()
                    handler.wfile.write(md.encode("utf-8"))
                except Exception as _e:
                    handler.json_out(500, {"ok": False, "error": str(_e)[:120]})
                return
            if method == "POST" and path == "/api/chat":
                self.chat(user)
                return
            if method == "GET" and path == "/api/chats":
                self.chats(user)
                return
            if method == "GET" and path.startswith("/api/chat/"):
                self.get_chat(user, path)
                return
            if method == "DELETE" and path.startswith("/api/chat/"):
                self.delete_chat(user, path)
                return
            self.json_out(404, {"ok": False, "error": "Not found."})
        except ValueError as e:
            self.json_out(400, {"ok": False, "error": str(e)})
        except Exception:
            traceback.print_exc()
            self.json_out(500, {"ok": False, "error": "Alfred hit a snag. Please try again."})

    do_GET = route
    do_POST = route
    do_DELETE = route

    def plan_info(self, user, cfg):
        plan = str(user.get("plan") or "Free").title()
        if plan not in ("Free", "Pro", "Ultra"):
            plan = "Free"
        caps = cfg.get("daily_caps") or {}
        return plan, int(caps.get(plan, 20))

    def chat(self, user):
        data = self.body()
        message = str(data.get("message") or "").strip()
        # v401: load any attached files as prompt context
        try:
            _att_ids = data.get("attachments") or []
            if _att_ids:
                _att_txt = file_upload.load_for_prompt(_att_ids)
                if _att_txt:
                    message = message + _att_txt
        except Exception as _e:
            print("[v401 attachments] fail:", _e, flush=True)
        # v390: router decides if research is needed
        _research_txt, _research_src = "", []
        _route_decision = {"search": False, "complex": False}
        try:
            if react_pipeline and message and len(message) <= 12000:
                _chain_probe = chain_for(config(), "Free")  # cheap probe; refined below
                def _probe_model(m, sysp, turns):
                    try: return _direct(m, api_key(config()), sysp, turns) or ""
                    except Exception: return ""
                _route_decision = react_pipeline.route(message, _probe_model, _chain_probe or [])
                print("[v390 router] %s" % _route_decision, flush=True)
                if _route_decision.get("search") and tools_web:
                    _research_txt, _research_src = tools_web.search(message)
        except Exception as _e:
            print("[v390 router] fail-open:", _e, flush=True)

        try: _memblock = __import__("memory2").recall_block(user["_uid"], message)
        except Exception: _memblock = ""
        try: _sklblock = __import__("skillsys").block_for(message)
        except Exception: _sklblock = ""
        if not message:
            self.json_out(400, {"ok": False, "error": "Write a message first."})
            return
        if len(message) > 12000:
            self.json_out(400, {"ok": False, "error": "That message is too long."})
            return

        cfg = config()
        key = api_key(cfg)
        _pl, _pc = self.plan_info(user, cfg)
        try: _IMG["list"] = [x for x in (data.get("images") or []) if isinstance(x, dict) and x.get("data")][-2:]
        except Exception: _IMG["list"] = []
        chain = chain_for(cfg, _pl)
        if not key or not chain:
            self.json_out(503, {"ok": False,
                "error": "No engine key configured yet - add GOOGLE_API_KEY or brain_config.json gemini_key."})
            return

        uid = user["_uid"]
        plan, cap = self.plan_info(user, cfg)
        today, now = day_utc(), time.time()
        limit = max(1, int(cfg.get("minute_limit", 6)))
        context_count = max(2, min(40, int(cfg.get("context_messages", 12))))
        chat_id = data.get("chat_id")
        if chat_id not in (None, ""):
            try:
                chat_id = int(chat_id)
            except (TypeError, ValueError):
                self.json_out(400, {"ok": False, "error": "Invalid chat id."})
                return

        c = db()
        try:
            c.execute("BEGIN IMMEDIATE")
            used = c.execute("SELECT count FROM usage WHERE user_id=? AND day=?",
                             (uid, today)).fetchone()
            used = int(used["count"]) if used else 0
            if used >= cap:
                c.rollback()
                self.json_out(429, {"ok": False, "error":
                    "You have used all %d messages for today on the %s plan. Your mind rests until midnight - or upgrade in Plans." % (cap, plan)})
                return
            recent = c.execute(
                "SELECT COUNT(*) AS n FROM messages m JOIN chats h ON h.id=m.chat_id "
                "WHERE h.user_id=? AND m.role='user' AND m.ts>?",
                (uid, now - 60)).fetchone()["n"]
            if recent >= limit:
                c.rollback()
                self.json_out(429, {"ok": False,
                    "error": "One moment - you are sending faster than I can think."})
                return
            if chat_id is None:
                cur = c.execute("INSERT INTO chats(user_id,title,created,updated) VALUES(?,?,?,?)",
                                (uid, message[:48], now, now))
                chat_id = cur.lastrowid
            else:
                owns = c.execute("SELECT id FROM chats WHERE id=? AND user_id=?",
                                 (chat_id, uid)).fetchone()
                if not owns:
                    c.rollback()
                    self.json_out(404, {"ok": False, "error": "Chat not found."})
                    return
            c.execute("INSERT INTO messages(chat_id,role,content,ts) VALUES(?,?,?,?)",
                      (chat_id, "user", message, now))
            c.execute("UPDATE chats SET updated=? WHERE id=?", (now, chat_id))
            c.execute("INSERT INTO usage(user_id,day,count) VALUES(?,?,1) "
                      "ON CONFLICT(user_id,day) DO UPDATE SET count=count+1",
                      (uid, today))
            rows = c.execute(
                "SELECT role,content FROM messages WHERE chat_id=? ORDER BY id DESC LIMIT ?",
                (chat_id, context_count)).fetchall()
            c.commit()
        finally:
            c.close()

        turns = []
        for row in reversed(rows):
            turns.append(("model" if row["role"] == "assistant" else "user", row["content"]))
        try:
            answer, used_model = None, None


            try: _sse_out(handler, {"phase": "answering", "label": "Writing the answer"})
            except Exception: pass
            for model in chain:
                try:
                    answer = _direct(model, key, (_tier_persona(user, plan) + _research_txt + _memblock + _sklblock), turns)
                    used_model = model
                    if plan == "Ultra" and answer:
                        try:
                            _crit = ("You are the second mind in Alfred's council. Review the draft answer above "
                                     "in context. Fix anything wrong, sharpen the reasoning, keep the warm butler voice. "
                                     "Reply with ONLY the improved final answer.")
                            _r2 = _direct(model, key, (_tier_persona(user, plan) + _research_txt + _memblock + _sklblock),
                                         list(turns) + [("assistant", answer), ("user", _crit)])
                            if _r2 and len(str(_r2)) > 40:
                                answer = _r2
                                print("council: Ultra answer refined", flush=True)
                        except Exception:
                            print("council: refinement skipped", flush=True)
                    break
                except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ValueError) as e:
                    print("model %s failed: %s" % (model, str(e)[:180]), flush=True)
                    if isinstance(e, RecursionError):
                        import traceback as _tbe
                        print(_tbe.format_exc(limit=8)[-900:],
                              flush=True)
                except Exception as e:
                    print("model %s failed: %s" % (model, str(e)[:180]), flush=True)
                    if isinstance(e, RecursionError):
                        import traceback as _tbe
                        print(_tbe.format_exc(limit=8)[-900:],
                              flush=True)
            try:
                if _research_src and answer and "Sources:" not in answer:
                    answer += "\n\nSources:\n" + "\n".join("- " + _u for _u in _research_src[:3])
            except Exception:
                pass
            if answer is None:
                self.json_out(502, {"ok": False,
                    "error": "My engines are catching their breath - try again in a moment."})
                return
            with db() as c:
                c.execute("INSERT INTO messages(chat_id,role,content,ts) VALUES(?,?,?,?)",
                          (chat_id, "assistant", answer, time.time()))
                c.execute("UPDATE chats SET updated=? WHERE id=?", (time.time(), chat_id))
            try: __import__("memory2").maybe_extract(user["_uid"], message, answer, lambda _s, _t: _direct("gemini-flash-lite-latest", key, _s, _t))
            except Exception: pass
            public = (cfg.get("public_names") or {}).get(plan, "Alfred")
            self.json_out(200, {"ok": True, "chat_id": chat_id, "reply": answer,
                "model": public, "remaining": max(0, cap - used - 1)})
        except Exception:
            traceback.print_exc()
            self.json_out(500, {"ok": False, "error": "Alfred hit a snag. Please try again."})

    def chats(self, user):
        with db() as c:
            rows = c.execute(
                "SELECT h.id,h.title,h.updated,"
                "(SELECT COUNT(*) FROM messages m WHERE m.chat_id=h.id) AS msgcount "
                "FROM chats h WHERE h.user_id=? ORDER BY h.updated DESC",
                (user["_uid"],)).fetchall()
        self.json_out(200, {"ok": True, "chats": [dict(r) for r in rows]})

    def chat_id_from_path(self, path):
        try:
            return int(path.rsplit("/", 1)[1])
        except (ValueError, IndexError):
            return None

    def get_chat(self, user, path):
        chat_id = self.chat_id_from_path(path)
        if chat_id is None:
            self.json_out(400, {"ok": False, "error": "Invalid chat id."})
            return
        with db() as c:
            owns = c.execute("SELECT id FROM chats WHERE id=? AND user_id=?",
                             (chat_id, user["_uid"])).fetchone()
            if not owns:
                self.json_out(404, {"ok": False, "error": "Chat not found."})
                return
            rows = c.execute(
                "SELECT role,content,ts FROM messages WHERE chat_id=? ORDER BY id",
                (chat_id,)).fetchall()
        self.json_out(200, {"ok": True, "messages": [dict(r) for r in rows]})

    def delete_chat(self, user, path):
        chat_id = self.chat_id_from_path(path)
        if chat_id is None:
            self.json_out(400, {"ok": False, "error": "Invalid chat id."})
            return
        with db() as c:
            owns = c.execute("SELECT id FROM chats WHERE id=? AND user_id=?",
                             (chat_id, user["_uid"])).fetchone()
            if not owns:
                self.json_out(404, {"ok": False, "error": "Chat not found."})
                return
            c.execute("DELETE FROM messages WHERE chat_id=?", (chat_id,))
            c.execute("DELETE FROM chats WHERE id=? AND user_id=?", (chat_id, user["_uid"]))
        self.json_out(200, {"ok": True})


# ===== v130: M2 living brain (SSE streaming + thinking-model budget) =====
def _v130_install():
    GEM_MAXTOK = 4096

    def _gemini_v130(model, key, system, turns):
        url = "https://generativelanguage.googleapis.com/v1beta/models/" + \
              urllib.parse.quote(model, safe="") + ":generateContent?" + \
              urllib.parse.urlencode({"key": key})
        contents = [{"role": role, "parts": [{"text": text}]} for role, text in turns]
        if _IMG["list"]:
            try:
                for _im in _IMG["list"][-2:]:
                    contents[-1]["parts"].append({"inline_data": {"mime_type": _im.get("mime","image/jpeg"), "data": _im["data"]}})
            except Exception: pass
        payload = {"systemInstruction": {"parts": [{"text": system}]}, "contents": contents,
                   "generationConfig": {"temperature": 0.8, "maxOutputTokens": GEM_MAXTOK}}
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"),
                                     headers={"Content-Type": "application/json"}, method="POST")
        with _open_retry(req, timeout=90) as r:
            data = json.loads(r.read().decode("utf-8"))
        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        text = "".join(p.get("text", "") for p in parts if p.get("text") and not p.get("thought")).strip()
        if not text:
            raise RuntimeError("Provider returned an empty answer")
        return text

    globals()["gemini"] = _gemini_v130      # upgrades the normal /api/chat path too

    def _sse_out(h, obj):
        h.wfile.write(b"data: " + json.dumps(obj, ensure_ascii=False).encode("utf-8") + b"\n\n")
        h.wfile.flush()

    def _chat_stream(handler, user):
        data = handler.body()
        message = str(data.get("message") or "").strip()
        # v390: SAFE route_decision — always defined
        _route_decision = {"search": False, "complex": False}
        _research_txt, _research_src = "", []
        try:
            if react_pipeline and message and len(message) <= 12000:
                _probe_chain = chain_for(config(), "Free") or []
                def _probe_model(m, sysp, turns, _k=None):
                    try: return _direct(m, _k or api_key(config()), sysp, turns) or ""
                    except Exception: return ""
                # v401: try local heuristic router first (0ms, zero cost)
                _local = router_local.classify(message)
                if _local.get("confidence") == "high" or _local.get("level") == "no_llm":
                    _route_decision = {
                        "search": _local.get("search", False),
                        "complex": _local.get("level") == "large",
                        "topic": "",
                        "level": _local.get("level", "large"),
                        "quick_reply": _local.get("quick_reply"),
                        "math": _local.get("math", False),
                        "source": "local",
                    }
                    print("[v401 router-local] %s" % _local, flush=True)

                else:
                    _route_decision = react_pipeline.route(message, _probe_model, _probe_chain) or _route_decision
                    _route_decision["source"] = "llm"
                    print("[v390 router-llm] %s" % _route_decision, flush=True)
                if _route_decision.get("search") and tools_web:
                    _research_txt, _research_src = tools_web.search(message)
                    print("[v390 search] %d sources" % len(_research_src or []), flush=True)
        except Exception as _e:
            print("[v390 router] fail-open:", _e, flush=True)
        # v390: research now comes from router above
        try: _memblock = __import__("memory2").recall_block(user["_uid"], message)
        except Exception: _memblock = ""
        try: _sklblock = __import__("skillsys").block_for(message)
        except Exception: _sklblock = ""
        if not message:
            handler.json_out(400, {"ok": False, "error": "Write a message first."}); return
        if len(message) > 12000:
            handler.json_out(400, {"ok": False, "error": "That message is too long."}); return
        cfg = config()
        if cfg.get("stream") is False:
            handler.json_out(501, {"ok": False, "error": "Streaming disabled."}); return
        key = api_key(cfg)
        _pl2, _pc2 = handler.plan_info(user, cfg)
        try: _IMG["list"] = [x for x in (data.get("images") or []) if isinstance(x, dict) and x.get("data")][-2:]
        except Exception: _IMG["list"] = []
        chain = chain_for(cfg, _pl2)
        if not key or not chain:
            handler.json_out(503, {"ok": False, "error": "No engine key configured yet."}); return

        uid = user["_uid"]; plan, cap = handler.plan_info(user, cfg)
        today, now = day_utc(), time.time()
        limit = max(1, int(cfg.get("minute_limit", 6)))
        context_count = max(2, min(40, int(cfg.get("context_messages", 12))))
        chat_id = data.get("chat_id")
        if chat_id not in (None, ""):
            try: chat_id = int(chat_id)
            except (TypeError, ValueError):
                handler.json_out(400, {"ok": False, "error": "Invalid chat id."}); return

        c = db()
        try:
            c.execute("BEGIN IMMEDIATE")
            used = c.execute("SELECT count FROM usage WHERE user_id=? AND day=?", (uid, today)).fetchone()
            used = int(used["count"]) if used else 0
            if used >= cap:
                c.rollback()
                handler.json_out(429, {"ok": False, "error":
                    "You have used all %d messages for today on the %s plan. Your mind rests until midnight - or upgrade in Plans." % (cap, plan)})
                return
            recent = c.execute(
                "SELECT COUNT(*) AS n FROM messages m JOIN chats h ON h.id=m.chat_id "
                "WHERE h.user_id=? AND m.role='user' AND m.ts>?", (uid, now - 60)).fetchone()["n"]
            if recent >= limit:
                c.rollback()
                handler.json_out(429, {"ok": False, "error": "One moment - you are sending faster than I can think."})
                return
            if chat_id is None:
                cur = c.execute("INSERT INTO chats(user_id,title,created,updated) VALUES(?,?,?,?)",
                                (uid, message[:48], now, now))
                chat_id = cur.lastrowid
            else:
                owns = c.execute("SELECT id FROM chats WHERE id=? AND user_id=?", (chat_id, uid)).fetchone()
                if not owns:
                    c.rollback(); handler.json_out(404, {"ok": False, "error": "Chat not found."}); return
            c.execute("INSERT INTO messages(chat_id,role,content,ts) VALUES(?,?,?,?)", (chat_id, "user", message, now))
            c.execute("UPDATE chats SET updated=? WHERE id=?", (now, chat_id))
            c.execute("INSERT INTO usage(user_id,day,count) VALUES(?,?,1) "
                      "ON CONFLICT(user_id,day) DO UPDATE SET count=count+1", (uid, today))
            rows = c.execute("SELECT role,content FROM messages WHERE chat_id=? ORDER BY id DESC LIMIT ?",
                             (chat_id, context_count)).fetchall()
            c.commit()
        finally:
            c.close()

        turns = [("model" if r["role"] == "assistant" else "user", r["content"]) for r in reversed(rows)]

        handler.send_response(200)
        handler.cors_headers()
        handler.send_header("Content-Type", "text/event-stream; charset=utf-8")
        handler.send_header("Cache-Control", "no-store")
        handler.send_header("Connection", "close")
        handler.end_headers()
        handler.close_connection = True
        _sse_out(handler, {"chat_id": chat_id})
        # v401f: quick-reply short-circuit (post-headers, safe)
        _qr = _route_decision.get("quick_reply")
        _math = _route_decision.get("math")
        if _qr or _math:
            _a = _qr
            if _math:
                _a = None
                try:
                    _v = router_local.safe_math(message)
                    if _v is not None:
                        _a = "That comes to " + str(_v) + "."
                except Exception:
                    _a = None
            if _a:
                try: _sse_out(handler, {"phase": "answering", "label": "Writing the answer"})
                except Exception: pass
                try: _sse_out(handler, {"t": _a})
                except Exception: pass
                try: _sse_out(handler, {"done": True, "chat_id": chat_id, "remaining": max(0, cap - used - 1)})
                except Exception: pass
                return


        full, broken = [], False

        # v390: reasoning phase (only for complex questions)
        _reasoning = ""
        try: _route_decision
        except NameError: _route_decision = {"search": False, "complex": False}
        if react_pipeline and _route_decision.get("complex"):
            try:
                def _reason_model(m, sysp, turns):
                    try: return _direct(m, key, sysp, turns) or ""
                    except Exception: return ""
                _reasoning = react_pipeline.reason(message, _research_txt, _memblock, _sklblock,
                                                   _reason_model, chain)
                if _reasoning:
                    _sse_out(handler, {"think": _reasoning})
                    print("[v390 reason] %d chars" % len(_reasoning), flush=True)
            except Exception as _e:
                print("[v390 reason] fail-open:", _e, flush=True)

        for model in chain:
            if "/" in model and not model.startswith("models/"):
                print("stream branch try: %s" % model, flush=True)
                try:
                    _sys = react_pipeline.build_answer_system(
                        _tier_persona(user, plan) + _memblock + _sklblock,
                        _reasoning, _research_txt) if react_pipeline else (
                        _tier_persona(user, plan) + _research_txt + _memblock + _sklblock)
                    _ans = _direct(model, key, _sys, turns)
                    print("stream branch: %s -> %s chars" % (model, len(_ans or "")), flush=True)
                    if _ans:
                        try:
                            if _research_src and "Sources:" not in _ans:
                                _ans += "\n\nSources:\n" + "\n".join("- " + _u for _u in _research_src[:3])
                        except Exception:
                            pass
                        _sse_out(handler, {"t": _ans})
                        try: __import__("memory2").maybe_extract(user["_uid"], message, _ans, lambda _s, _t: _direct("gemini-flash-lite-latest", key, _s, _t))
                        except Exception: pass
                        full.append(_ans)
                        break
                except Exception as _e:
                    print("stream %s failed: %s" % (model, str(_e)[:120]), flush=True)
            if "/" in model:
                print("stream skip native (slash model): %s" % model, flush=True)
                continue
            try:
                print("stream native try: %s" % model, flush=True)
                url = ("https://generativelanguage.googleapis.com/v1beta/models/" +
                       urllib.parse.quote(model, safe="") +
                       ":streamGenerateContent?alt=sse&" + urllib.parse.urlencode({"key": key}))
                contents = [{"role": role, "parts": [{"text": text}]} for role, text in turns]
                if _IMG["list"]:
                    try:
                        for _im in _IMG["list"][-2:]:
                            contents[-1]["parts"].append({"inline_data": {"mime_type": _im.get("mime","image/jpeg"), "data": _im["data"]}})
                    except Exception: pass
                payload = {"systemInstruction": {"parts": [{"text": (_tier_persona(user, plan) + _research_txt + _memblock + _sklblock)}]},
                           "contents": contents,
                           "generationConfig": {"temperature": 0.8, "maxOutputTokens": GEM_MAXTOK}}
                req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"),
                                             headers={"Content-Type": "application/json"}, method="POST")
                with urllib.request.urlopen(req, timeout=35) as up:
                    for raw in up:
                        line = raw.decode("utf-8", "replace").strip()
                        if not line.startswith("data:"):
                            continue
                        try:
                            chunk = json.loads(line[5:].strip())
                        except Exception:
                            continue
                        cand = (chunk.get("candidates") or [{}])[0]
                        for p in (cand.get("content") or {}).get("parts", []):
                            t = p.get("text")
                            if t and not p.get("thought"):
                                full.append(t)
                                _sse_out(handler, {"t": t})
                break
            except (BrokenPipeError, ConnectionResetError, OSError):
                broken = True; break
            except Exception as e:
                print("stream model %s failed: %s" % (model, str(e)[:180]), flush=True)
                continue

        answer = "".join(full).strip()
        try:
            if _research_src and answer and "Sources:" not in answer:
                answer += "\n\nSources:\n" + "\n".join("- " + _u for _u in _research_src[:3])
        except Exception:
            pass
        if answer:
            with db() as c:
                c.execute("INSERT INTO messages(chat_id,role,content,ts) VALUES(?,?,?,?)",
                          (chat_id, "assistant", answer, time.time()))
                c.execute("UPDATE chats SET updated=? WHERE id=?", (time.time(), chat_id))
        if not broken:
            if not answer:
                try: _sse_out(handler, {"error": "My engines are catching their breath - try again in a moment."})
                except Exception: pass
            try: __import__("memory2").maybe_extract(user["_uid"], message, answer, lambda _s, _t: _direct("gemini-flash-lite-latest", key, _s, _t))
            except Exception: pass
            public = (cfg.get("public_names") or {}).get(plan, "Alfred")
            try:
                _sse_out(handler, {"done": True, "chat_id": chat_id, "model": public,
                                   "remaining": max(0, cap - used - 1)})
            except Exception: pass

    _orig_route = Handler.route

    def _route_v130(self):
        try:
            if self.command == "POST" and urllib.parse.urlparse(self.path).path == "/api/chat/stream":
                if not self.origin_ok(): return
                user = self.require_user()
                if not user: return
                _chat_stream(self, user); return
        except ValueError as e:
            try: self.json_out(400, {"ok": False, "error": str(e)})
            except Exception: self.close_connection = True
            return
        except (BrokenPipeError, ConnectionResetError):
            self.close_connection = True; return
        except Exception:
            traceback.print_exc()
            try: self.json_out(500, {"ok": False, "error": "Alfred hit a snag. Please try again."})
            except Exception: self.close_connection = True
            return
        return _orig_route(self)

    Handler.route = _route_v130
    Handler.do_GET = _route_v130
    Handler.do_POST = _route_v130
    Handler.do_DELETE = _route_v130

try:
    _v130_install()
except Exception:
    traceback.print_exc()


# ===== v137: bearer-token fallback (mirrors auth.py) =====
def _v137_brain_install():
    _prev = Handler.auth_user
    def _auth_v137(self):
        try:
            u = _prev(self)
            if u: return u
        except Exception: pass
        tok = (self.headers.get("X-Alfred-Token") or "").strip()
        if not tok:
            authz = self.headers.get("Authorization") or ""
            if authz.lower().startswith("bearer "): tok = authz[7:].strip()
        if not tok: return None
        token_hash = hashlib.sha256(tok.encode()).hexdigest()
        with db() as c:
            row = c.execute("SELECT user_id FROM sessions WHERE token_hash=? AND expires>?",
                            (token_hash, time.time())).fetchone()
            if not row: return None
            user = c.execute("SELECT rowid AS _uid,* FROM users WHERE rowid=?",
                             (row["user_id"],)).fetchone()
            return dict(user) if user else None
    Handler.auth_user = _auth_v137

try:
    _v137_brain_install()
except Exception:
    traceback.print_exc()


# ===== v157: GET /api/usage (plan + daily credits for the navbar pill) =====
def _v157_usage_install():
    _prev = Handler.route
    def _route_v157(self):
        try:
            p = urllib.parse.urlparse(self.path).path
            if self.command == "GET" and p == "/api/usage":
                user = self.auth_user()
                if not user:
                    self.json_out(401, {"ok": False, "error": "Please sign in."})
                    return
                cfg = config()
                plan, cap = self.plan_info(user, cfg)
                with db() as c:
                    row = c.execute("SELECT count FROM usage WHERE user_id=? AND day=?",
                                    (user["_uid"], day_utc())).fetchone()
                used = int(row["count"]) if row else 0
                self.json_out(200, {"ok": True, "plan": plan, "used": used,
                                    "cap": cap, "remaining": max(0, cap - used)})
                return
        except Exception:
            traceback.print_exc()
        return _prev(self)
    Handler.route = _route_v157
    Handler.do_GET = _route_v157
    Handler.do_POST = _route_v157
    Handler.do_DELETE = _route_v157
    print("brain v157: /api/usage armed")
_v157_usage_install()

# ===== v330brain: maker prompt override + bonus credits (append-only) =====
def _v330_install():
    try:
        with db() as c:
            c.execute("CREATE TABLE IF NOT EXISTS credit_bank(user_id INTEGER PRIMARY KEY, extra INTEGER NOT NULL DEFAULT 0, updated REAL)")
    except Exception as _e:
        print("v330: credit_bank skipped", str(_e)[:60], flush=True)
    global _tier_persona
    if not getattr(_tier_persona, "_v330", False):
        _orig_tp = _tier_persona
        def _tp_v330(user, plan, *_a, **_k):
            base = _orig_tp(user, plan, *_a, **_k)
            try:
                _p = os.path.join(HERE, "prompt_override_" + str(plan).lower() + ".md")
                if os.path.exists(_p):
                    _txt = open(_p, encoding="utf-8", errors="replace").read().strip()
                    if _txt:
                        base += "\nINSTRUCTIONS FROM ALFRED'S MAKER (highest priority, follow exactly):\n" + _txt[:6000]
            except Exception:
                pass
            return base
        _tp_v330._v330 = True
        _tier_persona = _tp_v330
        print("v330: maker prompt override armed", flush=True)
    try:
        _orig_pi = Handler.plan_info
        if not getattr(_orig_pi, "_v330", False):
            def _pi_v330(self, user, cfg, *_a, **_k):
                plan, cap = _orig_pi(self, user, cfg, *_a, **_k)
                try:
                    with db() as c:
                        r = c.execute("SELECT extra FROM credit_bank WHERE user_id=?", (user["_uid"],)).fetchone()
                        if r and r["extra"]:
                            cap = int(cap) + int(r["extra"])
                except Exception:
                    pass
                return plan, cap
            _pi_v330._v330 = True
            Handler.plan_info = _pi_v330
            print("v330: bonus credits wired into cap", flush=True)
    except AttributeError:
        print("v330: plan_info not on Handler - skipped", flush=True)
    except Exception as _e:
        print("v330: plan_info wrap failed", str(_e)[:80], flush=True)

_v330_install()


if __name__ == "__main__":
    init_db()
    print("brain up - port 8082", flush=True)
    ThreadingHTTPServer(("127.0.0.1", 8082), Handler).serve_forever()
