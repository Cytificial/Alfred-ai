# v461: tier registry - the single source of truth for what a plan unlocks.
# Read side is safe to call from the chat path; it is a single indexed lookup.
import json, os, sqlite3, threading

DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "alfred.db")
LOCK = threading.RLock()
FALLBACK = "free"          # unknown tiers fail closed to free

SCHEMA = """
CREATE TABLE IF NOT EXISTS tiers(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rank INTEGER NOT NULL DEFAULT 0,
  daily_cap INTEGER NOT NULL DEFAULT 60,
  council INTEGER NOT NULL DEFAULT 1,
  refine INTEGER NOT NULL DEFAULT 0,
  chain_key TEXT NOT NULL DEFAULT 'free',
  prompt_key TEXT NOT NULL DEFAULT 'prompt_override_free.md',
  theme TEXT NOT NULL DEFAULT '{}',
  greeting TEXT NOT NULL DEFAULT '',
  ord INTEGER NOT NULL DEFAULT 0)"""

SEED = [
 ("free", "Free", 0, 60, 1, 0, "free", "prompt_override_free.md",
  '{"accent":"#7CC4FF","glow":"rgba(124,196,255,.28)","surface":"#0B1220"}',
  "Good to see you. What shall we think about?", 0),
 ("pro", "Pro", 1, 500, 2, 0, "pro", "prompt_override_pro.md",
  '{"accent":"#9BE7C4","glow":"rgba(155,231,196,.30)","surface":"#0A1A16"}',
  "Everything is unlocked and humming. Where shall we start?", 1),
 ("ultra", "Ultra", 2, 100000, 3, 1, "ultra", "prompt_override_ultra.md",
  '{"accent":"#FFD37A","glow":"rgba(255,211,122,.32)","surface":"#1A1408"}',
  "Every mind is at your disposal. Give me the hard one.", 2),
]


def _c():
    db = sqlite3.connect(DB, timeout=5)
    db.row_factory = sqlite3.Row
    return db


def ensure():
    """Idempotent - safe to call on every boot."""
    with LOCK:
        db = _c()
        try:
            db.execute(SCHEMA)
            for r in SEED:
                db.execute(
 "INSERT INTO tiers(id,name,rank,daily_cap,council,refine,chain_key,"
                  "prompt_key,theme,greeting,ord) VALUES(?,?,?,?,?,?,?,?,?,?,?) "
                  "ON CONFLICT(id) DO NOTHING", r)
            db.commit()
        finally:
            db.close()


def _row(t):
    if not t:
        return None
    t = str(t).strip().lower()
    with LOCK:
        db = _c()
        try:
            return db.execute(
              "SELECT * FROM tiers WHERE id=? OR lower(name)=?", (t, t)).fetchone()
        finally:
            db.close()


def _shape(row):
    d = dict(row)
    try:
        d["theme"] = json.loads(d.get("theme") or "{}")
    except Exception:
        d["theme"] = {}
    return d


def get(tid):
    """Never returns None - falls back to free."""
    ensure()
    return _shape(_row(tid) or _row(FALLBACK))


def resolve(plan):
    """Map a stored users.plan value onto a tier. Unknown -> free."""
    r = _row(plan)
    if r is None:
        return get(FALLBACK)
    return _shape(r)


def for_user(email):
    db = _c()
    try:
        r = db.execute("SELECT plan FROM users WHERE lower(email)=lower(?)",
 (email,)).fetchone()
    finally:
        db.close()
    return resolve(r["plan"] if r else None)


def all_tiers():
    ensure()
    db = _c()
    try:
        out = []
        for r in db.execute("SELECT * FROM tiers ORDER BY ord"):
            d = dict(r)
            try:
                d["theme"] = json.loads(d.get("theme") or "{}")
            except Exception:
                d["theme"] = {}
            out.append(d)
        return out
    finally:
        db.close()


def normalize_plans():
    """Repair legacy rows only. Never rewrites a recognised plan name."""
    ensure()
    db = _c()
    fixed, unknown = [], []
    try:
        for r in db.execute("SELECT id,email,plan FROM users").fetchall():
            p = (r["plan"] or "").strip()
            if _row(p) is None:
                unknown.append((r["email"], p))
                db.execute("UPDATE users SET plan=? WHERE id=?", ("Free", r["id"]))
                fixed.append((r["email"], p))
        db.commit()
    finally:
        db.close()
    return fixed, unknown


# ===== v462: admin assignment + audit trail =====
import time as _time

AUDIT = """
CREATE TABLE IF NOT EXISTS tier_audit(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  old_plan TEXT,
  new_plan TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT '',
  at REAL NOT NULL)"""


def _audit_table():
    with LOCK:
        db = _c()
        try:
            db.execute(AUDIT)
            db.commit()
        finally:
            db.close()


def set_plan(email, plan, actor=""):
    """Assign a tier. Returns the resolved tier dict, or None if rejected."""
    ensure()
    t = _row(plan)
    if t is None: # unknown tier -> refuse, never guess
        return None
    _audit_table()
    name = t["name"]
    db = _c()
    try:
        r = db.execute("SELECT plan FROM users WHERE lower(email)=lower(?)",
                       (email,)).fetchone()
        if not r:
            return None
        old = (r["plan"] or "").strip()
        db.execute("UPDATE users SET plan=? WHERE lower(email)=lower(?)",
                   (name, email))
        db.execute("INSERT INTO tier_audit(email,old_plan,new_plan,actor,at)"
                   " VALUES(?,?,?,?,?)",
                   (email, old, name, str(actor or "")[:80], _time.time()))
        db.commit()
    finally:
        db.close()
    return get(t["id"])


def audit_recent(limit=50):
    _audit_table()
    db = _c()
    try:
        return [dict(r) for r in db.execute(
            "SELECT * FROM tier_audit ORDER BY id DESC LIMIT ?", (int(limit),))]
    finally:
        db.close()


def entitlements_for(email):
    """What the UI may show. Never an authorization source."""
    t = for_user(email)
    return {
        "ok": True,
        "tier": t["id"],
        "name": t["name"],
        "rank": t["rank"],
        "daily_cap": t["daily_cap"],
        "council": t["council"],
        "refine": bool(t["refine"]),
        "theme": t["theme"],
        "greeting": t["greeting"],
    }
