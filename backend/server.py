#!/usr/bin/env python3
"""ALFRED backend — serves the web app + /api routes.
Run:  python3 ~/alfred-ai/backend/server.py"""
import json, os, urllib.request
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs, quote

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)          # ~/alfred-ai  (web root)
PORT = 8080

def load_keys():
    keys = {}
    p = os.path.join(HERE, "keys.env")
    if os.path.exists(p):
        for line in open(p):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1); keys[k.strip()] = v.strip()
    keys.update({k: v for k, v in os.environ.items() if k.endswith("_API_KEY")})
    return keys
KEYS = load_keys()
import threading, time as _t, uuid as _u
_EXLOCK = threading.Lock()
_RATE = {}

class H(SimpleHTTPRequestHandler):
    def send_head(self):
        if self.path.split("?")[0].startswith("/api/"):
            try:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(b'{"ok": false, "error": "Not found"}')
            except Exception:
                pass
            return None
        return super().send_head()

    def __init__(self, *a, **kw): super().__init__(*a, directory=ROOT, **kw)
    def log_message(self, *a): pass
    # v196: the app's own files are NEVER cached by browsers (fix-stale-forever)
    def end_headers(self):
        p = (self.path or "").split("?")[0]
        if p == "/" or p.endswith("/index.html") or p.endswith("/app.js") or p.endswith("/login.html"):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()
    def mem_route(self):
        """v361b: /api/memory/list + /api/memory/delete - session-scoped, uid never from request."""
        path = self.path.split("?")[0]
        if path not in ("/api/memory/list", "/api/memory/delete"):
            return False
        try:
            import hashlib as _hlM, sqlite3 as _sqM, json as _jsM, time as _tM
            _tokM = (self.headers.get("X-Alfred-Token") or "").strip()
            for _pM in self.headers.get("Cookie", "").split(";"):
                if "alfred_session=" in _pM:
                    _tokM = _pM.split("=", 1)[1].strip()
            _uidM = None
            if _tokM:
                con = _sqM.connect(os.path.join(HERE, "alfred.db"), timeout=10)
                try:
                    row = con.execute("SELECT user_id FROM sessions WHERE token_hash IN (?,?) AND expires>?",
                                      (_tokM, _hlM.sha256(_tokM.encode()).hexdigest(), _tM.time())).fetchone()
                    if row: _uidM = row[0]
                finally:
                    con.close()
            if not _uidM:
                self._json(401, {"ok": False, "error": "sign in first"})
                return True
            import memory2 as _m2
            if path == "/api/memory/list":
                rows = _m2.listing(_uidM)
                self._json(200, {"ok": True, "memories": rows, "items": rows})
                return True
            n = int(self.headers.get("Content-Length", 0) or 0)
            try:
                b = _jsM.loads(self.rfile.read(n) or b"{}")
            except Exception:
                self._json(400, {"ok": False, "error": "bad json"})
                return True
            try:
                mid = int(b.get("id", 0))
            except Exception:
                mid = 0
            if mid <= 0:
                self._json(400, {"ok": False, "error": "bad id"})
                return True
            if not _m2.forget(_uidM, mid):
                self._json(404, {"ok": False, "error": "no such memory"})
                return True
            self._json(200, {"ok": True, "deleted": mid})
            return True
        except Exception:
            self._json(500, {"ok": False, "error": "memory route failed"})
            return True

    def _json(self, code, obj):
        b = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers(); self.wfile.write(b)

    def blocked(self, p):
        """v366: secrets never served - denylist + traversal guard on every GET."""
        try:
            q = (p or "").split("?")[0].lstrip("/").lower()
        except Exception:
            q = ""
        if not q or ".." in q: return True
        if "keys.env" in q or ".db" in q or ".git" in q: return True
        return q.startswith(("backend/", "backups/", "tools/", "."))

    def do_GET(self):
        if self.blocked(self.path):
            self._json(404, {"ok": False, "error": "Not found."})
            return

        if self.mem_route(): return
        if self.path == "/api/health":
            return self._json(200, {"ok": True, "status": "online", "brain": "ready"})
        if self.path.startswith("/api/image"):      # v77: cached + retried
            q = parse_qs(urlparse(self.path).query)
            raw = q.get("prompt", ["nebula"])[0]
            sd = q.get("seed", ["7"])[0]
            w = q.get("width", ["768"])[0]; h = q.get("height", ["1024"])[0]
            import hashlib, time as _t
            cdir = os.path.join(HERE, "cache"); os.makedirs(cdir, exist_ok=True)
            fn = os.path.join(cdir, hashlib.md5((raw + "|" + sd).encode()).hexdigest() + ".jpg")
            if os.path.exists(fn):
                b = open(fn, "rb").read()
                self.send_response(200)
                self.send_header("Content-Type", "image/jpeg")
                self.send_header("Content-Length", str(len(b)))
                self.send_header("Cache-Control", "public, max-age=604800")
                self.end_headers()
                try: self.wfile.write(b)
                except BrokenPipeError: pass
                return
            got = None
            for att in range(3):
                try:
                    u = ("https://image.pollinations.ai/prompt/"
                         + quote(raw + ", photorealistic, cinematic, no text")
                         + "?width=" + w + "&height=" + h + "&nologo=true&seed="
                         + str(int(sd) + att * 377))
                    d = urllib.request.urlopen(u, timeout=120).read()
                    if d and len(d) > 5000: got = d; break
                except Exception:
                    pass
                _t.sleep(2)
            if not got:
                self.send_response(302)
                self.send_header("Location", "https://image.pollinations.ai/prompt/"
                                 + quote(raw) + "?width=" + w + "&height=" + h + "&nologo=true&seed=" + sd)
                self.end_headers(); return
            try: open(fn, "wb").write(got)
            except Exception: pass
            self.send_response(200)
            self.send_header("Content-Type", "image/jpeg")
            self.send_header("Content-Length", str(len(got)))
            self.send_header("Cache-Control", "public, max-age=604800")
            self.end_headers()
            try: self.wfile.write(got)
            except BrokenPipeError: pass
            return
        if self.path == "/api/explore":                 # v78: community feed
            fp = os.path.join(HERE, "explore.json")
            try:
                data = json.load(open(fp))
            except Exception:
                data = []
            import time as _t
            now_ms = int(_t.time() * 1000)
            keep = [q for q in data if isinstance(q, dict) and now_ms - int(q.get("ts", 0) or 0) <= 30*24*3600*1000]
            if len(keep) != len(data):
                with _EXLOCK:
                    tmp = fp + ".tmp"; open(tmp, "w").write(json.dumps(keep)); os.replace(tmp, fp)
            data = keep
            return self._json(200, data)
        if self.path.startswith("/api/warm"):           # v82: background pre-generate
            q = parse_qs(urlparse(self.path).query)
            raw = q.get("prompt", [""])[0]; sd = q.get("seed", ["7"])[0]
            if not raw: return self._json(200, {"ok": 0})
            import hashlib as _h, threading as _th
            cdir = os.path.join(HERE, "cache"); os.makedirs(cdir, exist_ok=True)
            fn = os.path.join(cdir, _h.md5((raw + "|" + sd).encode()).hexdigest() + ".jpg")
            if os.path.exists(fn): return self._json(200, {"ok": 1, "cached": True})
            def _job():
                for att in range(3):
                    try:
                        u = ("https://image.pollinations.ai/prompt/" + quote(raw + ", photorealistic, cinematic, no text")
                             + "?width=768&height=1024&nologo=true&seed=" + str(int(sd) + att * 377))
                        d = urllib.request.urlopen(u, timeout=120).read()
                        if d and len(d) > 5000:
                            open(fn, "wb").write(d); break
                    except Exception: pass
                    _t.sleep(4)
            _th.Thread(target=_job, daemon=True).start()
            return self._json(200, {"ok": 1, "started": True})
        return super().do_GET()                          # static frontend

    def do_POST(self):
        if self.mem_route(): return
        if self.path == "/api/explore":                 # v78: share with everyone
            n = int(self.headers.get("Content-Length", 0) or 0)
            try:
                b = json.loads(self.rfile.read(n) or b"{}")
            except Exception:
                return self._json(400, {"error": "bad json"})
            pr = str(b.get("prompt", ""))[:300].strip()
            kd = b.get("kind") if b.get("kind") in ("image", "video") else "image"
            if not pr:
                return self._json(400, {"error": "empty prompt"})
            nowt = _t.time(); ip = self.client_address[0]
            if nowt - _RATE.get(ip, 0) < 3:
                return self._json(429, {"error": "slow down"})
            _RATE[ip] = nowt
            item = {"id": "u" + _u.uuid4().hex[:10], "ts": int(nowt * 1000), "kind": kd,
                    "prompt": pr, "seed": int(b.get("seed") or 7) % 100000,
                    "by": str(b.get("by") or "Guest")[:24], "authorId": str(b.get("authorId") or "")[:40],
                    "origin": "user", "likes": 0}
            fp = os.path.join(HERE, "explore.json")
            with _EXLOCK:
                try:
                    data = json.load(open(fp))
                except Exception:
                    data = []
                data.append(item)
                tmp = fp + ".tmp"
                open(tmp, "w").write(json.dumps(data[-60:]))
                os.replace(tmp, fp)
            return self._json(200, item)
        if self.path == "/api/memory":
            n = int(self.headers.get("Content-Length", 0) or 0)
            try:
                b = json.loads(self.rfile.read(n) or b"{}")
            except Exception:
                return self._json(400, {"error": "bad json"})
            import hashlib as _hl, sqlite3 as _sq
            tok = (self.headers.get("X-Alfred-Token") or "").strip()
            for part in self.headers.get("Cookie", "").split(";"):
                if "alfred_session=" in part:
                    tok = part.split("=", 1)[1].strip()
            nowt = _t.time()
            ip = self.client_address[0]
            if nowt - globals().setdefault("_MRATE", {}).get(ip, 0) < 1:
                return self._json(429, {"error": "slow down"})
            globals().setdefault("_MRATE", {})[ip] = nowt
            con = _sq.connect(os.path.join(HERE, "alfred.db"), timeout=10)
            con.execute("CREATE TABLE IF NOT EXISTS memories(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, text TEXT, ts REAL)")
            uid = None
            if tok:
                cands = [tok]
                for _al in ['sha256']:
                    cands.append(getattr(_hl, _al)(tok.encode()).hexdigest())
                try:
                    _qm = ",".join("?" * len(cands))
                    r = con.execute("SELECT user_id FROM sessions WHERE token_hash IN (%s) AND expires>?" % _qm, cands + [nowt]).fetchone()
                    if r: uid = r[0]
                except Exception:
                    uid = None
            if not uid:
                con.close()
                return self._json(401, {"error": "sign in first"})
            txt = str(b.get("text", "")).strip()[:200]
            if not txt:
                con.close()
                return self._json(400, {"error": "empty"})
            cnt = con.execute("SELECT COUNT(*) FROM memories WHERE user_id=?", (uid,)).fetchone()[0]
            if cnt >= 40:
                con.execute("DELETE FROM memories WHERE id=(SELECT MIN(id) FROM memories WHERE user_id=?)", (uid,))
            con.execute("INSERT INTO memories(user_id,text,ts) VALUES(?,?,?)", (uid, txt, nowt))
            con.commit()
            con.close()
            return self._json(200, {"ok": True})
        if self.path == "/api/feedback":
            n = int(self.headers.get(
                "Content-Length", 0) or 0)
            try:
                b = json.loads(self.rfile.read(n)
                               or b"{}")
            except Exception:
                return self._json(400,
                    {"error": "bad json"})
            v = b.get("vote")
            if v not in ("up", "down"):
                return self._json(400,
                    {"error": "vote?"})
            nowt = _t.time()
            ip = self.client_address[0]
            if nowt - _RATE.get(ip, 0) < 2:
                return self._json(429,
                    {"error": "slow down"})
            _RATE[ip] = nowt
            import sqlite3 as _sq
            con = _sq.connect(
                os.path.join(HERE, "alfred.db"),
                timeout=10)
            con.execute("CREATE TABLE IF NOT EXISTS"
                " feedback(id INTEGER PRIMARY KEY"
                " AUTOINCREMENT, user_id INTEGER,"
                " chat_id INTEGER, vote TEXT,"
                " snippet TEXT, ts REAL)")
            uid = None
            try:
                tok = ""
                for part in self.headers.get(
                        "Cookie", "").split(";"):
                    if "alfred_session=" in part:
                        tok = part.split("=", 1)[1]
                cols = [r[1] for r in con.execute(
                    "PRAGMA table_info(sessions)")]
                if tok and "token" in cols:
                    r = con.execute("SELECT user_id"
                        " FROM sessions WHERE token=?",
                        (tok.strip(),)).fetchone()
                    if r: uid = r[0]
            except Exception:
                uid = None
            con.execute("INSERT INTO feedback(user_id,"
                "chat_id,vote,snippet,ts)"
                " VALUES(?,?,?,?,?)",
                (uid, b.get("chat_id"), v,
                 str(b.get("snippet", ""))[:300],
                 nowt))
            con.commit(); con.close()
            return self._json(200, {"ok": True})
        if self.path == "/api/chat-v217b-retired":  # v217b: dead duplicate — frontend uses :8082 only                     # the brain (Gemini)
            n = int(self.headers.get("Content-Length", 0) or 0)
            body = json.loads(self.rfile.read(n) or b"{}")
            key = KEYS.get("GOOGLE_API_KEY")
            if not key: return self._json(500, {"error": "add GOOGLE_API_KEY to backend/keys.env"})
            contents = [{"role": "user" if m.get("role") == "user" else "model",
                         "parts": [{"text": m.get("content", "")}]} for m in body.get("messages", [])]
            req = urllib.request.Request(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + key,
                data=json.dumps({"contents": contents}).encode(),
                headers={"Content-Type": "application/json"})
            try:
                d = json.load(urllib.request.urlopen(req, timeout=120))
                return self._json(200, {"reply": d["candidates"][0]["content"]["parts"][0]["text"]})
            except Exception as e:
                return self._json(502, {"error": str(e)[:200]})
        return self._json(404, {"error": "unknown api"})

ThreadingHTTPServer.allow_reuse_address = True
print("ALFRED backend  ->  http://127.0.0.1:%d   (web root: %s)" % (PORT, ROOT))
# ---- v116auth: real login/signup (injected) ----
try:
    try:
        import auth as _v116auth
    except ImportError:
        import os as _os, importlib.util as _ilu
        _ap = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "auth.py")
        _spec = _ilu.spec_from_file_location("alfred_auth", _ap)
        _v116auth = _ilu.module_from_spec(_spec); _spec.loader.exec_module(_v116auth)
    def _v116wrap(_cls, _name, _meth):
        _orig = getattr(_cls, _name, None)
        if _orig is None: return
        def _patched(self, *a, **k):
            try:
                if _v116auth.maybe_handle(self, _meth): return
            except Exception as _e:
                print("[auth]", _e)
            return _orig(self, *a, **k)
        setattr(_cls, _name, _patched)
    for _c in [v for v in list(globals().values()) if isinstance(v, type)]:
        if hasattr(_c, "do_POST") and hasattr(_c, "do_GET"):
            _v116wrap(_c, "do_GET", "GET")
            _v116wrap(_c, "do_POST", "POST")
            print("[auth] wired into", _c.__name__)
except Exception as _e:
    print("[auth] init failed:", _e)
# ---- v216admin: dashboard API (must sit BEFORE serve_forever) ----
try:
    import admin as _v216adm
    def _v216admwrap(_cls, _name, _meth):
        _orig = getattr(_cls, _name, None)
        if _orig is None: return
        def _patched(self, *a, **k):
            try:
                if _v216adm.maybe_handle(self, _meth): return
            except Exception as _e:
                print("[admin]", _e)
            return _orig(self, *a, **k)
        setattr(_cls, _name, _patched)
    for _c in [v for v in list(globals().values()) if isinstance(v, type)]:
        if hasattr(_c, "do_POST") and hasattr(_c, "do_GET"):
            _v216admwrap(_c, "do_GET", "GET"); _v216admwrap(_c, "do_POST", "POST")
            print("[admin] wired into", _c.__name__)
except Exception as _e:
    print("[admin] init failed:", _e)

ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
