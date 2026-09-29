#!/usr/bin/env python3
"""ALFRED admin API - v216. Wired into server.py after the auth block."""
import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
import providers as _prov
import time as _t  # v228.1: stats needs time
import json, os, sqlite3, time, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
DBP  = os.path.join(HERE, "alfred.db")
CFG  = os.path.join(HERE, "brain_config.json")
ADMIN = "cyberartificial1@gmail.com"
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
    if (me[0] or "").lower() not in (ADMIN, "admin@alfred.ai"):
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

    if method == "POST" and p == "/api/admin/users/delete":
        b = _body(handler)
        email = str(b.get("email", "")).strip().lower()
        if not email:
            return _send(handler, 400, {"ok": False, "error": "need email"})
        if email == ADMIN:
            return _send(handler, 400, {"ok": False, "error": "cannot delete the admin account"})
        if email == (me[0] or "").lower():
            return _send(handler, 400, {"ok": False, "error": "cannot delete yourself"})
        db = sqlite3.connect(DBP)
        r = db.execute("SELECT id FROM users WHERE lower(email)=?", (email,)).fetchone()
        if not r:
            db.close(); return _send(handler, 404, {"ok": False, "error": "no such user"})
        uid = r[0]
        for t in ("sessions", "reset_tokens"):
            try: db.execute("DELETE FROM %s WHERE user_id=?" % t, (uid,))
            except Exception: pass
        n = db.execute("DELETE FROM users WHERE id=?", (uid,)).rowcount
        db.commit(); db.close()
        return _send(handler, 200, {"ok": n > 0, "deleted": email})

    if method == "GET" and p == "/api/admin/stats":
        db = sqlite3.connect(DBP); db.row_factory = sqlite3.Row
        wk = _t.time() - 7*86400; dy = _t.time() - 86400
        total = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        new7  = db.execute("SELECT COUNT(*) FROM users WHERE created>?", (wk,)).fetchone()[0]
        plans = {r["plan"]: r["n"] for r in db.execute("SELECT plan, COUNT(*) n FROM users GROUP BY plan")}
        sess  = db.execute("SELECT COUNT(*) FROM sessions WHERE expires>?", (_t.time(),)).fetchone()[0]
        acts  = {r["reason"]: r["n"] for r in db.execute("SELECT reason, COUNT(*) n FROM auth_log WHERE ts>? GROUP BY reason", (dy,))}
        db.close()
        return _send(handler, 200, {"ok": True, "users_total": total, "users_new_7d": new7,
                    "plans": plans, "active_sessions": sess, "auth_24h": acts,
                    "engine": _engine(), "brain": _cfg()})

    if method == "POST" and p == "/api/admin/users/revoke":
        b = _body(handler)
        email = str(b.get("email", "")).strip().lower()
        if not email:
            return _send(handler, 400, {"ok": False, "error": "need email"})
        db = sqlite3.connect(DBP)
        r = db.execute("SELECT id FROM users WHERE lower(email)=?", (email,)).fetchone()
        if not r:
            db.close(); return _send(handler, 404, {"ok": False, "error": "no such user"})
        n = db.execute("DELETE FROM sessions WHERE user_id=?", (r[0],)).rowcount
        db.commit(); db.close()
        return _send(handler, 200, {"ok": True, "revoked": n})

    if method == "GET" and p == "/api/admin/metrics":
        import time as _tm
        db = sqlite3.connect(DBP)
        def cols(t): return [c[1] for c in db.execute("PRAGMA table_info(%s)" % t)]
        def pick(t, cands):
            cs = cols(t)
            for c in cands:
                if c in cs: return c
            return None
        now = _tm.time(); out = {"msgs_24h": None, "tokens_24h": None, "model_mix": []}
        mts = pick("messages", ["ts", "created_at", "timestamp", "time", "created"])
        if mts:
            samp = db.execute("SELECT %s FROM messages LIMIT 1" % mts).fetchone()
            iso = samp and isinstance(samp[0], str)
            cond = ("%s > datetime('now','-1 day')" % mts) if iso else ("%s > ?" % mts)
            args = () if iso else (now - 86400,)
            out["msgs_24h"] = db.execute("SELECT COUNT(*) FROM messages WHERE " + cond, args).fetchone()[0]
            mm = pick("messages", ["model", "model_id", "engine"])
            if mm:
                rows = db.execute("SELECT %s, COUNT(*) c FROM messages WHERE %s GROUP BY %s ORDER BY c DESC LIMIT 5" % (mm, cond, mm), args).fetchall()
                out["model_mix"] = [{"model": str(r[0])[:24], "n": r[1]} for r in rows if r[0]]
        tk, uts = pick("usage", ["tokens", "total_tokens", "tok", "prompt_tokens", "completion_tokens"]), pick("usage", ["ts", "created_at", "timestamp", "time", "created"])
        if tk and uts:
            out["tokens_24h"] = db.execute("SELECT COALESCE(SUM(%s),0) FROM usage WHERE %s > ?" % (tk, uts), (now - 86400,)).fetchone()[0]
        out["chats_total"] = db.execute("SELECT COUNT(*) FROM chats").fetchone()[0]
        try: out["failed_24h"] = db.execute("SELECT COUNT(*) FROM auth_log WHERE ok IN (0,'0','false') AND ts > ?", (now - 86400,)).fetchone()[0]
        except Exception:
            try: out["failed_24h"] = db.execute("SELECT COUNT(*) FROM auth_log WHERE ok IN (0,'0','false')").fetchone()[0]
            except Exception: out["failed_24h"] = None
        if "expires" in cols("sessions"):
            out["active_sessions"] = db.execute("SELECT COUNT(*) FROM sessions WHERE expires > ?", (now,)).fetchone()[0]
        db.close()
        return _send(handler, 200, {"ok": True, "metrics": out})

    if method == "GET" and p == "/api/admin/showcase":
        import json as _j, os as _os
        _p = _os.path.normpath(_os.path.join(_os.path.dirname(DBP), "..", "showcase.json"))
        try: _d = _j.load(open(_p))
        except Exception: _d = {}
        return _send(handler, 200, {"ok": True, "items": _d.get("items", [])})

    if method == "POST" and p == "/api/admin/showcase":
        import json as _j, os as _os
        b = _body(handler)
        items = []
        for it in (b.get("items") or [])[:24]:
            if not isinstance(it, dict): continue
            name = str(it.get("name", ""))[:40].strip()
            if not name: continue
            items.append({"name": name, "desc": str(it.get("desc", ""))[:120].strip(),
                          "tier": str(it.get("tier", "Free")).capitalize() if str(it.get("tier", "")).lower() in ("free", "pro", "ultra") else "Pro"})
        _p = _os.path.normpath(_os.path.join(_os.path.dirname(DBP), "..", "showcase.json"))
        _t = _p + ".tmp"; open(_t, "w").write(_j.dumps({"ok": True, "items": items})); _os.replace(_t, _p)
        return _send(handler, 200, {"ok": True, "count": len(items)})

    if method == "GET" and p == "/api/admin/lab":
        import json as _j, os as _os
        _p = _os.path.normpath(_os.path.join(_os.path.dirname(DBP), "catalog.json"))
        try: cat = _j.load(open(_p))
        except Exception: cat = {"items": []}
        return _send(handler, 200, {"ok": True, "items": cat.get("items", [])[:200]})

    if method == "POST" and p == "/api/admin/lab/save":
        import json as _j, os as _os
        b = _body(handler); items = []
        for it in (b.get("items") or [])[:200]:
            if not isinstance(it, dict): continue
            mid = str(it.get("id", "")).strip()[:60]
            if not mid: continue
            items.append({"id": mid, "name": str(it.get("name", ""))[:40].strip() or mid,
                          "provider": str(it.get("provider", "google"))[:12],
                          "tier": str(it.get("tier", "Pro")).capitalize() if str(it.get("tier", "")).lower() in ("free", "pro", "ultra") else "Pro",
                          "status": str(it.get("status", "testing"))[:10]})
        _p = _os.path.normpath(_os.path.join(_os.path.dirname(DBP), "catalog.json"))
        _t = _p + ".tmp"; open(_t, "w").write(_j.dumps({"items": items})); _os.replace(_t, _p)
        return _send(handler, 200, {"ok": True, "count": len(items)})

    if method == "POST" and p == "/api/admin/lab/test":
        import json as _j, time as _t, urllib.request as _u, urllib.parse as _up
        b = _body(handler); mid = str(b.get("id", "")); prov = str(b.get("provider", "google"))
        try:
            if prov == "openrouter":
                k = _prov._keys().get("openrouter", "")
                if not k: return _send(handler, 200, {"ok": False, "error": "no openrouter key"})
                rq = _u.Request("https://openrouter.ai/api/v1/chat/completions",
                    data=_j.dumps({"model": mid, "messages": [{"role": "user", "content": "Reply OK"}], "max_tokens": 8}).encode(),
                    headers={"Content-Type": "application/json", "Authorization": "Bearer " + k}, method="POST")
            else:
                cfg = _cfg(); k = (cfg.get("gemini_key") or "").strip()
                if not k: return _send(handler, 200, {"ok": False, "error": "no google key"})
                rq = _u.Request("https://generativelanguage.googleapis.com/v1beta/models/" + _up.quote(mid, safe="") + ":generateContent?key=" + _up.quote(k),
                    data=_j.dumps({"contents": [{"role": "user", "parts": [{"text": "Reply OK"}]}], "generationConfig": {"maxOutputTokens": 8}}).encode(),
                    headers={"Content-Type": "application/json"}, method="POST")
            t0 = _t.time()
            with _u.urlopen(rq, timeout=30) as r: _j.loads(r.read().decode())
            return _send(handler, 200, {"ok": True, "ms": int((_t.time() - t0) * 1000)})
        except Exception as e:
            return _send(handler, 200, {"ok": False, "error": str(e)[:120]})

    if method == "POST" and p == "/api/admin/providers/test":
        import time as _t, json as _j, urllib.request as _u, urllib.parse as _up
        m = str((_body(handler) or {}).get("model", ""))
        try:
            t0 = _t.time()
            if m.startswith("pollinations/"):
                rq = _u.Request("https://text.pollinations.ai/openai",
                    data=_j.dumps({"model": "openai", "messages": [{"role": "user", "content": "Reply with the single word OK"}]}).encode(),
                    headers={"Content-Type": "application/json"}, method="POST")
                d = _j.load(_u.urlopen(rq, timeout=45))
                ok = bool((((d.get("choices") or [{}])[0].get("message") or {}).get("content") or "").strip())
            elif m.startswith("openrouter/"):
                k = (_prov._keys() or {}).get("openrouter", "")
                rq = _u.Request("https://openrouter.ai/api/v1/chat/completions",
                    data=_j.dumps({"model": m.split("/", 1)[1], "messages": [{"role": "user", "content": "Reply OK"}], "max_tokens": 8}).encode(),
                    headers={"Content-Type": "application/json", "Authorization": "Bearer " + k}, method="POST")
                d = _j.load(_u.urlopen(rq, timeout=45))
                ok = bool((((d.get("choices") or [{}])[0].get("message") or {}).get("content") or "").strip())
            else:
                key = ((_cfg() or {}).get("gemini_key") or "").strip()
                u = "https://generativelanguage.googleapis.com/v1beta/models/" + _up.quote(m, safe="") + ":generateContent?key=" + _up.quote(key)
                rq = _u.Request(u,
                    data=_j.dumps({"contents": [{"role": "user", "parts": [{"text": "Reply with the single word OK"}]}], "generationConfig": {"maxOutputTokens": 8}}).encode(),
                    headers={"Content-Type": "application/json"}, method="POST")
                d = _j.load(_u.urlopen(rq, timeout=45))
                ok = bool(((((d.get("candidates") or [{}])[0].get("content") or {}).get("parts") or [{}])[0].get("text") or "").strip())
            return _send(handler, 200, {"ok": True, "alive": ok, "ms": int((_t.time() - t0) * 1000)})
        except Exception as e:
            return _send(handler, 200, {"ok": True, "alive": False, "error": str(e)[:110]})

    if method == "POST" and p == "/api/admin/memory/list":
        import sqlite3 as _s
        em = str((_body(handler) or {})
                 .get("email", ""))
        con = _s.connect(DBP, timeout=10)
        r = con.execute("SELECT id FROM users"
            " WHERE email=?", (em,)).fetchone()
        if not r:
            con.close()
            return _send(handler, 404,
                {"ok": False,
                 "error": "no such user"})
        rows = [dict(zip(("id", "text"), x))
                for x in con.execute(
                "SELECT id,text FROM memories"
                " WHERE user_id=? ORDER BY id DESC",
                (r[0],))]
        con.close()
        return _send(handler, 200,
            {"ok": True, "items": rows})

    if method == "POST" and p == "/api/admin/memory/delete":
        import sqlite3 as _s
        i = (_body(handler) or {}).get("id")
        con = _s.connect(DBP, timeout=10)
        n = con.execute("DELETE FROM memories"
            " WHERE id=?",
            (i,)).rowcount
        con.commit(); con.close()
        return _send(handler, 200,
            {"ok": True, "deleted": n})

    if method == "GET" and p == "/api/admin/feedback":
        import sqlite3 as _s
        try:
            con = _s.connect(DBP, timeout=10)
            r0 = con.execute("SELECT "
                "SUM(CASE WHEN vote='up' THEN 1 "
                "ELSE 0 END), SUM(CASE WHEN "
                "vote='down' THEN 1 ELSE 0 END)"
                " FROM feedback").fetchone()
            up = int(r0[0] or 0)
            dn = int(r0[1] or 0)
            recent = [dict(zip(("vote", "snippet"),
                      r)) for r in con.execute(
                "SELECT vote,snippet FROM feedback"
                " ORDER BY id DESC LIMIT 8")]
            con.close()
        except Exception:
            up, dn, recent = 0, 0, []
        return _send(handler, 200,
            {"ok": True, "up": up, "down": dn,
             "recent": recent})

    if method == "POST" and p == "/api/admin/login":
        import os as _os, sqlite3 as _sq, hmac as _hm, secrets as _sc, time as _tm
        _now = _tm.time()
        _ip = handler.client_address[0]
        _lt = globals().setdefault("_LOGIN_T", {})
        if _now - _lt.get(_ip, 0) < 2:
            return _send(handler, 429, {"ok": False, "error": "slow down"})
        _lt[_ip] = _now
        b = _body(handler)
        want = ""
        _kp = _os.path.join(_os.path.dirname(DBP), "keys.env")
        if _os.path.exists(_kp):
            for _ln in open(_kp):
                if _ln.startswith("ADMIN_PASS="):
                    want = _ln.split("=", 1)[1].strip()
        try:
            _ok = _hm.compare_digest(str(b.get("password", "")), want)
        except Exception:
            _ok = False
        if not want or not _ok:
            return _send(handler, 403, {"ok": False, "error": "wrong password"})
        con = _sq.connect(DBP, timeout=10)
        try:
            _cols = [r[1] for r in con.execute("PRAGMA table_info(sessions)")]
            _tcol = next((c for c in _cols if "token" in c.lower()), None)
            _ucol = "user_id" if "user_id" in _cols else ("uid" if "uid" in _cols else None)
            if not _tcol or not _ucol:
                return _send(handler, 500, {"ok": False, "error": "sessions schema: " + ",".join(_cols)})
            _au = con.execute("SELECT id FROM users WHERE role='admin' ORDER BY id LIMIT 1").fetchone()
            if not _au:
                return _send(handler, 500, {"ok": False, "error": "no admin user in db"})
            _tok = _sc.token_urlsafe(32)
            _extra = []
            for _c in _cols:
                if _c in (_ucol, _tcol): continue
                if "expire" in _c.lower(): _extra.append((_c, _now + 86400 * 7))
                elif _c in ("created", "ts", "time"): _extra.append((_c, int(_now)))
            _names = [_ucol, _tcol] + [c for c, _v in _extra]
            _vals = [_au[0], _tok] + [v for _c, v in _extra]
            con.execute("INSERT INTO sessions(%s) VALUES(%s)" % (",".join(_names), ",".join(["?"] * len(_vals))), _vals)
            con.commit()
            return _send(handler, 200, {"ok": True, "token": _tok})
        except Exception as _e:
            return _send(handler, 500, {"ok": False, "error": str(_e)[:120]})
        finally:
            con.close()

    if method == "GET" and p == "/api/admin/models/catalog":
        import urllib.request as _ur
        _H = os.path.dirname(DBP)
        try:
            _pj = json.load(open(os.path.join(_H, "providers.json")))
        except Exception:
            _pj = {}
        recs = {}
        pr = _pj.get("providers")
        if isinstance(pr, dict):
            for k, v in pr.items():
                if isinstance(v, dict): recs[str(k)] = v
        elif isinstance(pr, list):
            for v in pr:
                if isinstance(v, dict) and v.get("id"): recs[str(v["id"])] = v
        out = {}
        for pid, rec in recs.items():
            base = str(rec.get("base_url") or rec.get("base") or "").rstrip("/")
            key = str(rec.get("api_key") or rec.get("key") or "")
            url, hdrs = None, {}
            if pid == "openrouter":
                url = (base or "https://openrouter.ai/api/v1") + "/models"
            elif pid == "pollinations":
                url = "https://text.pollinations.ai/models"
            elif base:
                url = base + "/models"
                if "generativelanguage" in base and key:
                    url = base + "/models?key=" + key
                elif key:
                    hdrs["Authorization"] = "Bearer " + key
            if not url:
                out[pid] = {"models": [], "err": "no base_url"}; continue
            try:
                rq = _ur.Request(url, headers=hdrs)
                with _ur.urlopen(rq, timeout=10) as _r:
                    d = json.loads(_r.read().decode("utf-8"))
                ids = []
                if isinstance(d, dict) and isinstance(d.get("data"), list):
                    ids = [str(m.get("id")) for m in d["data"] if isinstance(m, dict) and m.get("id")]
                elif isinstance(d, dict) and isinstance(d.get("models"), list):
                    ids = [str(m.get("name", "")).replace("models/", "") for m in d["models"] if isinstance(m, dict)]
                elif isinstance(d, list):
                    ids = [str(m.get("name") or m.get("id") or "") for m in d if isinstance(m, (dict, str)) and (m.get("name") if isinstance(m, dict) else m)]
                out[pid] = {"models": ids[:250], "total": len(ids)}
            except Exception as e:
                out[pid] = {"models": [], "err": str(e)[:80]}
        try:
            json.dump({"ok": True, "providers": out}, open(os.path.join(_H, "catalog.json"), "w"))
        except Exception:
            pass
        return _send(handler, 200, {"ok": True, "providers": out})

    if method == "POST" and p == "/api/admin/models/assign":
        b = _body(handler)
        model = str(b.get("model", "")).strip()[:80]
        level = str(b.get("level", "")).capitalize()
        pid = str(b.get("pid", "")).strip()[:20]
        if not model or level not in ("Free", "Pro", "Ultra"):
            return _send(handler, 400, {"ok": False, "error": "need model + level"})
        _H = os.path.dirname(DBP)
        _pjf = os.path.join(_H, "providers.json")
        try:
            _pj = json.load(open(_pjf))
        except Exception:
            _pj = {}
        ch = _pj.setdefault("chains", {}).setdefault(level, [])
        recs = _pj.get("providers")
        rec = None
        head = model.split("/")[0]
        if isinstance(recs, dict):
            rec = recs.get(head)
        elif isinstance(recs, list):
            for v in recs:
                if isinstance(v, dict) and str(v.get("id")) == head:
                    rec = v; break
        if "/" in model:
            full = model
        elif pid and pid != "google":
            full = pid + "/" + model
        elif rec:
            full = str(rec.get("id")) + "/" + model
        else:
            full = model
        if full not in ch:
            ch.append(full)
            del ch[:-8]
        _t2 = _pjf + ".tmp"
        open(_t2, "w").write(json.dumps(_pj, indent=1))
        os.replace(_t2, _pjf)
        return _send(handler, 200, {"ok": True, "added": full, "chains": _pj.get("chains", {})})

    if method == "GET" and p == "/api/admin/credits":
        import time as _t3
        cfg = _cfg()
        day = _t3.strftime("%Y-%m-%d", _t3.gmtime())
        db = sqlite3.connect(DBP); db.row_factory = sqlite3.Row
        rows = [dict(r) for r in db.execute(
            "SELECT u.email, u.plan, IFNULL(g.count,0) AS used FROM users u "
            "LEFT JOIN usage g ON g.user_id=u.id AND g.day=? ORDER BY g.count DESC", (day,))]
        db.close()
        return _send(handler, 200, {"ok": True, "day": day, "rows": rows, "caps": cfg.get("daily_caps") or {}})

    if method == "GET" and p == "/api/admin/providers":
        return _send(handler, 200, _prov.public())

    if method == "POST" and p == "/api/admin/providers/add":
        b = _body(handler)
        try: _prov.add(b.get("id"), b.get("type"), b.get("base_url"), b.get("api_key"))
        except Exception as e: return _send(handler, 400, {"ok": False, "error": str(e)[:120]})
        return _send(handler, 200, {"ok": True})

    if method == "POST" and p == "/api/admin/providers/scan":
        b = _body(handler)
        try: ms = _prov.scan(str(b.get("id", "")))
        except Exception as e: return _send(handler, 200, {"ok": False, "error": str(e)[:120]})
        return _send(handler, 200, {"ok": True, "count": len(ms), "models": ms[:80]})

    if method == "POST" and p == "/api/admin/providers/chains":
        b = _body(handler); plan = str(b.get("plan", "")).capitalize()
        if plan not in ("Free", "Pro", "Ultra") or not isinstance(b.get("models"), list):
            return _send(handler, 400, {"ok": False, "error": "need plan + models[]"})
        _prov.chains(plan, b["models"])
        return _send(handler, 200, {"ok": True, "plan": plan})

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
