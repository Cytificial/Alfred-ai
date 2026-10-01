"""Alfred backup: consistent SQLite snapshot -> gzip, keep last 7."""
import os, sqlite3, gzip, shutil, time

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(BASE, "backend", "alfred.db")
BK = os.path.join(BASE, "backups")

def run():
    os.makedirs(BK, mode=0o700, exist_ok=True)
    tmp = DB + ".snap-tmp"
    src = sqlite3.connect(DB)
    dst = sqlite3.connect(tmp)
    src.backup(dst)
    dst.close(); src.close()
    name = "alfred-" + time.strftime("%Y%m%d-%H%M") + ".db.gz"
    gz = os.path.join(BK, name)
    with open(tmp, "rb") as f, gzip.open(gz + ".tmp", "wb") as g:
        shutil.copyfileobj(f, g)
    os.rename(gz + ".tmp", gz)
    os.chmod(gz, 0o600)
    os.remove(tmp)
    keep = sorted((f for f in os.listdir(BK) if f.endswith(".db.gz")), reverse=True)[:7]
    for old in os.listdir(BK):
        if old.endswith(".db.gz") and old not in keep:
            os.remove(os.path.join(BK, old))
    print("backup: %s (%.1f KB)" % (name, os.path.getsize(gz) / 1024.0))

if __name__ == "__main__":
    run()
