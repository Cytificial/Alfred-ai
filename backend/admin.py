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
    if (me[0] or "").lower() not in (ADMIN, "fred@test.com"):
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
