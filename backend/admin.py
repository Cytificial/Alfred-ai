#!/usr/bin/env python3
"""ALFRED admin API - v216. Wired into server.py after the auth block."""
import json, os, sqlite3, time, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
DBP  = os.path.join(HERE, "alfred.db")
CFG  = os.path.join(HERE, "brain_config.json")
ADMIN = "fred@test.com"
PLANS = ("Free", "Pro", "Ultra")

def _send(h, code, obj):
    b = json.dumps(obj).encode()
    h.send_response(code); h.send_header("Content-Type", "application/json")
    h.send_header("Content-Length", str(len(b))); h.end_headers(); h.wfile.write(b)

def _me(h):
    tok = h.headers.get("X-Alfred-Token", "")
    if not tok:
        az = h.headers.get("Authorization", "") or ""
        if az.lower().startswith("bearer "): tok = az[7:].strip()
    if not tok:
        for part in (h.headers.get("Cookie", "") or "").split(";"):
            if "=" in part and part.split("=", 1)[0].strip() in ("alfred_token", "token"):
                tok = part.split("=", 1)[1].strip()
    if not tok:
        print("[admin] deny: no token presented", flush=True); return None
    print("[admin] token present, len=%d" % len(tok), flush=True)
    try:                       # auth.py knows how tokens are REALLY stored
        import auth as _auth
        for name in ("_user_from_session", "user_from_session", "_resolve_user",
                     "resolve_user", "_user_from_bearer", "user_from_bearer",
                     "_resolve_session", "resolve_session"):
            fn = getattr(_auth, name, None)
            if not callable(fn): continue
            try: r = fn(h)
            except Exception as e:
                print("[admin] %s threw: %s" % (name, str(e)[:90]), flush=True); continue
            u = _norm(r)
            if u:
                print("[admin] resolved via auth.%s" % name, flush=True); return u
        print("[admin] auth resolvers returned nothing", flush=True)
    except Exception as e:
        print("[admin] resolver path failed: %s" % str(e)[:90], flush=True)
    db = None                  # raw-token fallback
    try:
        db = sqlite3.connect(DBP)
        cols = [r[1] for r in db.execute("PRAGMA table_info(sessions)")]
        tcol = next((c for c in cols if "token" in c.lower() or c.lower() in ("key", "sess", "sid")), None)
        if not tcol:
            print("[admin] sessions cols:", cols, flush=True); return None
        ucol = next((c for c in cols if c.lower() in ("user_id", "uid", "userid")), cols[0])
        row = db.execute("SELECT %s FROM sessions WHERE %s=?" % (ucol, tcol), (tok,)).fetchone()
        if not row:
            print("[admin] raw lookup: no row (token may be hashed)", flush=True); return None
        ecol = next((c for c in cols if "exp" in c.lower()), None)
        if ecol:
            ev = float(db.execute("SELECT %s FROM sessions WHERE %s=?" % (ecol, tcol), (tok,)).fetchone()[0])
            if ev < 1e12: ev *= 1000.0
            if ev < time.time() * 1000.0:
                print("[admin] session expired", flush=True); return None
        uc = [r[1] for r in db.execute("PRAGMA table_info(users)")]
        e2 = next((c for c in uc if "email" in c.lower()), "email")
        n2 = next((c for c in uc if "name" in c.lower()), "name")
        p2 = next((c for c in uc if "plan" in c.lower()), "plan")
        i2 = next((c for c in uc if c.lower() in ("id", "user_id")), "id")
        return db.execute("SELECT %s,%s,%s FROM users WHERE %s=?" % (e2, n2, p2, i2), (row[0],)).fetchone()
    except Exception as e:
        print("[admin] raw lookup error:", str(e)[:120], flush=True); return None
    finally:
        if db: db.close()

def _norm(r):
    try:
        if r is None: return None
        if isinstance(r, dict):
            u = r.get("user") if r.get("ok") else r
            if isinstance(u, dict):
                em = u.get("email") or u.get("mail")
                if em: return (em, u.get("name") or "", u.get("plan") or "")
            return None
        vals = list(r)
        em = next((v for v in vals if isinstance(v, str) and "@" in v), None)
        if not em:
            try:
                db = sqlite3.connect(DBP)
                return db.execute("SELECT email,name,plan FROM users WHERE id=?", (vals[0],)).fetchone()
            except Exception: return None
        pl = next((v for v in vals[vals.index(em)+1:]
                   if isinstance(v, str) and v.strip().capitalize() in ("Free", "Pro", "Ultra")), "")
        return (em, "", pl)
    except Exception: return None

def _body(h):
    n = int(h.headers.get("Content-Length", 0) or 0)
    try: return json.loads(h.rfile.read(n) or b"{}")
    except Exception: return {}

def _cfg():
    try: return json.load(open(CFG))
    except Exception: return {"chain": [], "daily_caps": {}, "minute_limit": 6, "context_messages": 12, "public_names": {}}

def _engine():
    try: return json.load(urllib.request.urlopen("http://127.0.0.1:8082/health", timeout=3))
    except Exception as e: return {"ok": False, "error": str(e)[:80]}

def maybe_handle(handler, method):
    p = handler.path.split("?")[0]
    if not p.startswith("/api/admin/"): return False
    me = _me(handler)
    if not me:
        _send(handler, 403, {"ok": False, "error": "admin only"}); return True
    if (me[0] or "").lower() != ADMIN:
        print("[admin] deny: valid session, not admin (%s***)" % (me[0] or "")[:2], flush=True)
        _send(handler, 403, {"ok": False, "error": "admin only"}); return True

    if method == "GET" and p == "/api/admin/overview":
        db = sqlite3.connect(DBP); db.row_factory = sqlite3.Row
        users = [dict(r) for r in db.execute("SELECT id,email,name,plan FROM users ORDER BY id")]
        logs  = [dict(r) for r in db.execute("SELECT ts,email,ok,reason FROM auth_log ORDER BY ts DESC LIMIT 30")]
        db.close()
        by = {}
        for u in users: by[u["plan"]] = by.get(u["plan"], 0) + 1
        return _send(handler, 200, {"ok": True, "users": users, "byPlan": by,
                                    "logs": logs, "engine": _engine(), "brain": _cfg()})

    if method == "POST" and p == "/api/admin/users/plan":
        b = _body(handler)
        plan = str(b.get("plan", "")).capitalize()
        email = str(b.get("email", "")).strip().lower()
        if plan not in PLANS or not email:
            return _send(handler, 400, {"ok": False, "error": "need email + plan Free/Pro/Ultra"})
        db = sqlite3.connect(DBP)
        n = db.execute("UPDATE users SET plan=? WHERE lower(email)=?", (plan, email)).rowcount
        db.commit(); db.close()
        return _send(handler, 200, {"ok": n > 0, "plan": plan})

    if method == "GET" and p == "/api/admin/brain":
        c = _cfg(); c["gemini_key"] = "***set***" if c.get("gemini_key") else ""
        return _send(handler, 200, {"ok": True, "config": c, "engine": _engine()})

    if method == "POST" and p == "/api/admin/brain":
        b = _body(handler); c = _cfg()
        if isinstance(b.get("chain"), list):
            c["chain"] = [str(m).strip() for m in b["chain"] if str(m).strip()][:6]
        if isinstance(b.get("daily_caps"), dict):
            c["daily_caps"] = {str(k).capitalize(): max(1, min(9999, int(v)))
                               for k, v in b["daily_caps"].items() if str(k).capitalize() in PLANS}
        if "minute_limit" in b: c["minute_limit"] = max(1, min(60, int(b["minute_limit"])))
        if "context_messages" in b: c["context_messages"] = max(2, min(40, int(b["context_messages"])))
        if isinstance(b.get("public_names"), dict):
            c["public_names"] = {str(k).capitalize(): str(v)[:24]
                                 for k, v in b["public_names"].items() if str(k).capitalize() in PLANS}
        tmp = CFG + ".tmp"; open(tmp, "w").write(json.dumps(c, indent=1)); os.replace(tmp, CFG)
        return _send(handler, 200, {"ok": True, "config": c})

    return _send(handler, 404, {"ok": False, "error": "unknown admin route"})
