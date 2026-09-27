#!/usr/bin/env python3
"""ALFRED permanent doctor v216 - web (8080) + brain (8082) never stay down."""
import json, os, subprocess, time, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
LOG  = os.path.join(HERE, "doctor.log")
def log(m):
    line = time.strftime("%Y-%m-%d %H:%M:%S") + " " + m
    print(line, flush=True)
    try: open(LOG, "a").write(line + "\n")
    except Exception: pass
def alive(url):
    try: json.load(urllib.request.urlopen(url, timeout=4)); return True
    except Exception: return False
def watch(tag, script, url):
    if alive(url): return
    log(tag + " DOWN - restarting " + script)
    subprocess.Popen(["python3", os.path.join(HERE, script)],
        stdout=open(os.path.join(HERE, "engine.log"), "a"),
        stderr=subprocess.STDOUT, cwd=os.path.dirname(HERE))
    time.sleep(3)
    log(tag + " restart -> " + ("UP" if alive(url) else "STILL DOWN"))
print("doctor up - pid " + str(os.getpid()), flush=True)
while True:
    watch("web",   "server.py", "http://127.0.0.1:8080/api/health")
    watch("brain", "brain.py",  "http://127.0.0.1:8082/health")
    time.sleep(30)
    if time.strftime('%H%M')[-2:] == '00' and not getattr(watch, '_bk', False):
        subprocess.Popen(['python3', os.path.join(HERE, 'backup.py')])
        watch._bk = True
