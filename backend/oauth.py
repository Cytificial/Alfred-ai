#!/usr/bin/env python3
# Alfred AI — OAuth sidecar (Google / GitHub / Discord). Port 8081, third process.
import json, os, hashlib, hmac, html, secrets, sqlite3, time, urllib.parse, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
CFG  = os.path.join(HERE, "oauth_config.json")
DB   = os.path.join(HERE, "alfred.db")
PORT, APP_PORT = 8081, 8080
TTL_SESS, TTL_STATE = 30 * 86400, 600
SCK = {"google": "alfred_ost_g", "github": "alfred_ost_h", "discord": "alfred_ost_d"}
AUTH = {
 "google":  ("https://accounts.google.com/o/oauth2/v2/auth", "openid email profile"),
 "github":  ("https://github.com/login/oauth/authorize",     "read:user user:email"),
 "discord": ("https://discord.com/oauth2/authorize",         "identify email"),
}
TOKEN = {
 "google":  "https://oauth2.googleapis.com/token",
 "github":  "https://github.com/login/oauth/access_token",
 "discord": "https://discord.com/api/oauth2/token",
}

def creds(p):
    try:
        c = (json.load(open(CFG)) or {}).get(p) or {}
        return (c.get("client_id") or "", c.get("client_secret") or "")
    except Exception:
        return ("", "")

def post(url, data, hdrs=None):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode(),
                                 headers=dict(hdrs or {}))
    try:
        with urllib.request.urlopen(req, timeout=30) as f:
            return json.load(f)
    except Exception as e:
        try: body = e.read().decode(errors='replace')[:250]
        except Exception: body = str(e)
        raise RuntimeError('provider said: ' + body)

def getjson(url, tok):
    req = urllib.request.Request(url, headers={
        "Authorization": "Bearer " + tok, "User-Agent": "alfred-ai", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as f:
        return json.load(f)

def page(h, code, body, extra=None):
    b = body.encode()
    h.send_response(code)
    h.send_header("Content-Type", "text/html; charset=utf-8")
    h.send_header("Content-Length", str(len(b)))
    h.send_header("Cache-Control", "no-store")
    for kv in (extra or []): h.send_header(*kv)
    h.end_headers()
    h.wfile.write(b)

def shell(title, inner):
    return ("<!doctype html><html><head><meta charset=utf-8>"
            "<meta name=viewport content='width=device-width,initial-scale=1'><title>"
            + html.escape(title) + "</title><style>"
            "body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;"
            "background:radial-gradient(120% 120% at 50% 0%,#0b1c3c,#050b18);"
            "font-family:system-ui,sans-serif;color:#dbe9fb}"
            ".c{width:min(92vw,560px);background:rgba(10,20,40,.92);border:1px solid rgba(110,190,255,.35);"
            "border-radius:20px;padding:26px;box-shadow:0 18px 60px rgba(0,0,0,.5)}"
            "h1{font-size:20px;margin:0 0 12px;color:#9fd0ff}"
            "li{margin:9px 0;line-height:1.55;font-size:14.5px}"
            "code{background:rgba(80,160,255,.14);padding:2px 7px;border-radius:7px;font-size:12.5px;"
            "color:#bfe0ff;word-break:break-all}a{color:#7cc4ff}p{font-size:13.5px;line-height:1.5}"
            "</style></head><body><div class=c>" + inner + "</div></body></html>")

SETUP = {
 "google": ("<h1>Connect Google sign-in</h1><ol>"
   "<li>Open <a href='https://console.cloud.google.com/apis/credentials' target=_blank>console.cloud.google.com &rarr; APIs &amp; Services &rarr; Credentials</a></li>"
   "<li>Create <b>OAuth client ID</b> &rarr; type <b>Web application</b></li>"
   "<li>Authorized redirect URI — exactly: <code>http://localhost:8081/oauth/google/callback</code></li>"
   "<li>OAuth consent screen &rarr; <b>Testing</b> &rarr; add your Google account under <b>Test users</b></li>"
   "<li>Paste the client ID + secret into <code>backend/oauth_config.json</code></li></ol>"
   "<p>Google requires <code>localhost</code> (not an IP) for plain-HTTP dev, so Google sign-in runs on localhost — same app, same data.</p>"),
 "github": ("<h1>Connect GitHub sign-in</h1><ol>"
   "<li>Open <a href='https://github.com/settings/developers' target=_blank>github.com/settings/developers</a></li>"
   "<li><b>New OAuth App</b> &rarr; Homepage <code>http://127.0.0.1:8080</code></li>"
   "<li>Authorization callback URL — exactly: <code>http://127.0.0.1:8081/oauth/github/callback</code></li>"
   "<li>Paste the client ID + secret into <code>backend/oauth_config.json</code></li></ol>"),
 "discord": ("<h1>Connect Discord sign-in</h1><ol>"
   "<li>Open <a href='https://discord.com/developers/applications' target=_blank>discord.com/developers/applications</a></li>"
   "<li>New Application &rarr; <b>OAuth2</b> &rarr; <b>Add Redirect</b>: <code>http://127.0.0.1:8081/oauth/discord/callback</code></li>"
   "<li>Paste the client ID + secret into <code>backend/oauth_config.json</code></li></ol>"),
}

def upsert(email, name):
    db = sqlite3.connect(DB)
    try:
        cols = db.execute("PRAGMA table_info(users)").fetchall()
        names = [c[1] for c in cols]
        def find(*cands):
            for n in names:
                if n.lower() in cands: return n
            return None
        eid = find("email"); nid = find("name", "username")
        ph  = find("password_hash", "password", "pass_hash"); pl = find("plan", "tier")
        row = db.execute("SELECT rowid FROM users WHERE %s=?" % eid, (email,)).fetchone()
        if row:
            uid = row[0]
            if ph:
                cur = db.execute("SELECT %s FROM users WHERE rowid=?" % ph, (uid,)).fetchone()[0]
                if cur in (None, ""):
                    db.execute("UPDATE users SET %s=? WHERE rowid=?" % ph,
                               ("oauth:" + secrets.token_urlsafe(12), uid))
                    db.commit()
            return uid
        vals = {}
        for c in cols:
            n, nn, df, typ, pk = c[1], c[3], c[4], (c[2] or "").upper(), c[5]
            if pk: continue
            if n == eid: vals[n] = email
            elif n == nid: vals[n] = name or email.split("@")[0]
            elif n == ph: vals[n] = "oauth:" + secrets.token_urlsafe(12)
            elif n == pl: vals[n] = "Free"
            elif not nn or df is not None: continue
            else: vals[n] = 0 if ("INT" in typ or "REAL" in typ) else ""
        ks = ",".join(vals); qs = ",".join(["?"] * len(vals))
        db.execute("INSERT INTO users(%s) VALUES(%s)" % (ks, qs), list(vals.values()))
        db.commit()
        return db.execute("SELECT rowid FROM users WHERE %s=?" % eid, (email,)).fetchone()[0]
    finally:
        db.close()

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def cookie(self, name):
        for part in (self.headers.get("Cookie") or "").split(";"):
            k, _, v = part.strip().partition("=")
            if k == name: return v
        return None

    def do_GET(self):
        try:
            u = urllib.parse.urlparse(self.path)
            q = urllib.parse.parse_qs(u.query)
            parts = [s for s in u.path.split("/") if s]
            if u.path == "/health":
                b = json.dumps({"ok": True,
                    "configured": {p: bool(creds(p)[0] and creds(p)[1]) for p in AUTH}}).encode()
                self.send_response(200); self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(b))); self.end_headers()
                self.wfile.write(b); return
            if len(parts) == 2 and parts[0] == "oauth" and parts[1] in AUTH:
                return self.start(parts[1])
            if len(parts) == 3 and parts[0] == "oauth" and parts[1] in AUTH and parts[2] == "callback":
                return self.callback(parts[1], q)
            page(self, 404, shell("Alfred AI", "<h1>Alfred OAuth</h1><p>Unknown path.</p>"))
        except Exception as e:
            try:
                page(self, 500, shell("Alfred AI",
                     "<h1>Sign-in hit a snag</h1><p>" + html.escape(str(e)[:300]) + "</p>"))
            except Exception: pass

    def start(self, p):
        cid, sec = creds(p)
        if not (cid and sec):
            return page(self, 200, shell("Alfred AI", SETUP[p]))
        host = (self.headers.get("Host") or "").split(":")[0] or "127.0.0.1"
        if p == "google": host = "localhost"   # Google's HTTP dev exemption is localhost-only
        redir = "http://%s:%d/oauth/%s/callback" % (host, PORT, p)
        back  = "http://%s:%d/#/chat" % (host, APP_PORT)
        st = secrets.token_urlsafe(16)
        url = AUTH[p][0] + "?" + urllib.parse.urlencode({
            "client_id": cid, "redirect_uri": redir, "response_type": "code",
            "scope": AUTH[p][1], "state": st})
        ck = "%s=%s|%s; HttpOnly; Path=/; SameSite=Lax; Max-Age=%d" % (
            SCK[p], st, urllib.parse.quote(back, safe=""), TTL_STATE)
        self.send_response(302)
        self.send_header("Location", url)
        self.send_header("Set-Cookie", ck)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def callback(self, p, q):
        cid, sec = creds(p)
        raw = self.cookie(SCK[p]) or ""
        st, _, back = raw.partition("|")
        back = urllib.parse.unquote(back) if back else "http://127.0.0.1:%d/#/chat" % APP_PORT
        clear = "%s=; HttpOnly; Path=/; Max-Age=0" % SCK[p]
        if not (cid and sec):
            return page(self, 400, shell("Alfred AI", "<h1>Not configured yet</h1>"), [("Set-Cookie", clear)])
        err  = (q.get("error") or [None])[0]
        code = (q.get("code") or [None])[0]
        qs   = (q.get("state") or [None])[0]
        if err or not code or not st or not qs or not hmac.compare_digest(st, qs):
            return page(self, 400, shell("Alfred AI",
                "<h1>Sign-in cancelled</h1><p>State check failed — start again from the sign-in screen.</p>"),
                [("Set-Cookie", clear)])
        host = "localhost" if p == "google" else ((self.headers.get("Host") or "").split(":")[0] or "127.0.0.1")
        redir = "http://%s:%d/oauth/%s/callback" % (host, PORT, p)
        data = {"code": code, "redirect_uri": redir}
        if p in ("google", "discord"):
            data.update({"client_id": cid, "client_secret": sec, "grant_type": "authorization_code"})
        else:
            data.update({"client_id": cid, "client_secret": sec})
        tok = post(TOKEN[p], data, {"Accept": "application/json"}).get("access_token")
        if not tok: raise RuntimeError("token exchange failed")
        email = name = None
        if p == "google":
            me = getjson("https://openidconnect.googleapis.com/v1/userinfo", tok)
            if me.get("email_verified"): email, name = me.get("email"), me.get("name")
        elif p == "github":
            me  = getjson("https://api.github.com/user", tok)
            ems = getjson("https://api.github.com/user/emails", tok)
            pick = [e for e in ems if e.get("primary") and e.get("verified")] or \
                   [e for e in ems if e.get("verified")]
            if pick: email, name = pick[0]["email"], me.get("name") or me.get("login")
        else:
            me = getjson("https://discord.com/api/users/@me", tok)
            if me.get("email") and me.get("verified"):
                email = me["email"]; name = me.get("global_name") or me.get("username")
        if not email:
            return page(self, 403, shell("Alfred AI",
                "<h1>Email needed</h1><p>Your " + p +
                " account has no verified email to link. Verify it on " + p +
                " first, then retry.</p>"), [("Set-Cookie", clear)])
        uid = upsert(email.strip().lower(), name or "")
        token = secrets.token_urlsafe(32)
        db = sqlite3.connect(DB)
        db.execute("INSERT INTO sessions(token_hash,user_id,expires) VALUES(?,?,?)",
                   (hashlib.sha256(token.encode()).hexdigest(), uid, time.time() + TTL_SESS))
        db.commit(); db.close()
        sess = "alfred_session=%s; HttpOnly; Path=/; SameSite=Lax; Max-Age=%d" % (token, TTL_SESS)
        self.send_response(302)
        self.send_header("Location", back)
        self.send_header("Set-Cookie", sess)
        self.send_header("Set-Cookie", clear)
        self.send_header("Content-Length", "0")
        self.end_headers()

if __name__ == "__main__":
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), H)
    print("oauth sidecar up - http://127.0.0.1:%d" % PORT, flush=True)
    srv.serve_forever()
