#!/usr/bin/env python3
"""ALFRED daily DB backup - sqlite-safe copy, keeps 14."""
import sqlite3, time, os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(HERE, "alfred.db")
DST  = os.path.join(HERE, "backups")
os.makedirs(DST, exist_ok=True)
stamp = time.strftime("%Y-%m-%d_%H%M")
out = os.path.join(DST, "alfred-%s.db" % stamp)
src = sqlite3.connect(SRC); dst = sqlite3.connect(out)
src.backup(dst); dst.close(); src.close()
olds = sorted(os.listdir(DST))
for f in olds[:-14]:
    try: os.remove(os.path.join(DST, f))
    except Exception: pass
print("backup ->", out, "(", len(olds), "kept )", flush=True)
