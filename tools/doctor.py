#!/usr/bin/env python3
"""Alfred Doctor — deep check (default) + watchdog (watch)."""
import os, sys, time, json, sqlite3, urllib.request, subprocess, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG  = os.path.join(ROOT, "backend", "doctor.log")
def say(m): print(m, flush=True)
def log(m): say(m); open(LOG, "a").write(time.strftime("%F %T ") + m + "\n")
def get(url, t=4):
    try:
        with urllib.request.urlopen(url, timeout=t) as r: return r.status, r.read().decode()
    except Exception as e: return None, str(e)
def check(serve=True):
    ok = True
    s, _ = get("http://localhost:8080/")
    if s == 200:
        say("PASS  web      (8080 serving)")
        m = re.search(r"v=(\d+)", open(os.path.join(ROOT,"index.html")).read())
        disk = m.group(1) if m else "?"
        if serve and disk != "?":
            body = get("http://localhost:8080/")[1]
            served = (re.search(r"v=(\d+)", body) or [None,"?"])[1]
            say(("PASS  stale    (served v=%s == disk v=%s)" % (served, disk)) if served == disk
                else "FAIL  stale    (served v=%s != disk v=%s — OLD JS BEING SERVED)" % (served, disk))
            ok = ok and served == disk
    else: say("FAIL  web      (8080 down: %s)" % _); ok = False
    s, b = get("http://127.0.0.1:8082/health")
    if s == 200 and '"ok": true' in b:
        say("PASS  brain    (%s)" % (json.loads(b).get("model") or "?"))
    else: say("FAIL  brain    (%s)" % (b or "down")[:80]); ok = False
    try:
        c = sqlite3.connect(os.path.join(ROOT,"backend","alfred.db"))
        say("PASS  db       (integrity: %s)" % c.execute("PRAGMA integrity_check").fetchone()[0]); c.close()
    except Exception as e: say("FAIL  db       (%s)" % e); ok = False
    key = ""
    try: key = [l.split("=",1)[1].strip() for l in open(os.path.join(ROOT,"backend",".env")) if l.startswith("GOOGLE_API_KEY")][0]
    except Exception: pass
    say(("PASS  key      (present, %d chars)" % len(key)) if key else "FAIL  key      (backend/.env missing GOOGLE_API_KEY)")
    ok = ok and bool(key)
    du = int(subprocess.run(["df","-P",ROOT],capture_output=True,text=True).stdout.split()[11])
    say(("PASS  disk     (%d MB free)" % (du//1024)) if du > 500*1024 else ("FAIL  disk     (%d MB free!)" % (du//1024)))
    return ok
def restart(name):
    log("doctor: restarting %s" % name)
    subprocess.run("bash -c 'set -a; . %s/backend/.env 2>/dev/null; set +a; "
                   "nohup python3 %s/backend/%s >> %s/backend/engine.log 2>&1 &'"
                   % (ROOT, ROOT, name, ROOT), shell=True)
def watch():
    lock = os.path.join(ROOT, "backend", ".doctor.lock")
    if os.path.exists(lock): sys.exit("doctor already watching (pid in lockfile)")
    open(lock,"w").write(str(os.getpid()))
    fails, restarts, backoff = 0, [], 0
    try:
        while True:
            web, _ = get("http://localhost:8080/", 3)
            brain, _ = get("http://127.0.0.1:8082/health", 3)
            now = time.time()
            restarts = [t for t in restarts if now - t < 3600]
            if web != 200 or (brain != 200):
                fails += 1
                if fails >= 2 and len(restarts) < 3:
                    log("doctor: 2 consecutive fails — restarting")
                    if web != 200: restart("server.py")
                    if brain != 200: restart("brain.py")
                    restarts.append(now); fails = 0; backoff = min(backoff + 60, 900)
                elif len(restarts) >= 3:
                    log("doctor: 3 restarts/hour reached — STOPPING auto-restarts. Manual help needed.")
                else:
                    time.sleep(max(10, backoff) if fails else 0)
            else: fails, backoff = 0, 0
            time.sleep(30)
    finally: os.remove(lock)
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "watch":
        say("doctor: watching — 30s rounds, 2-fail restart rule, 3/hour cap"); watch()
    else:
        ok = check()
        say(""); say(("ALL CLEAR ✓" if ok else "ISSUES FOUND ✗ — paste the FAIL lines to bro"))
        sys.exit(0 if ok else 1)
