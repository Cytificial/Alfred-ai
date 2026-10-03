# v468: create or reset the admin account directly. Never exposed over HTTP.
import getpass, os, sqlite3, secrets, sys, time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import auth

EMAIL = (os.environ.get("ALFRED_ADMIN_EMAIL") or "admin@alfred.ai").strip().lower()
pw = sys.argv[1] if len(sys.argv) > 1 else getpass.getpass("password: ")
if len(pw) < 8:
    sys.exit("password must be at least 8 characters")

salt = secrets.token_hex(16)
h = auth._hash_pw(pw, salt)
c = auth._conn()
try:
    row = c.execute("SELECT id FROM users WHERE lower(email)=?", (EMAIL,)).fetchone()
    if row:
        c.execute("UPDATE users SET pw_hash=?, salt=?, plan='Ultra' WHERE lower(email)=?",
                  (h, salt, EMAIL))
        print("password reset for", EMAIL)
    else:
        c.execute("INSERT INTO users(name,email,pw_hash,salt,plan,created)"
                  " VALUES(?,?,?,?,?,?)",
                  ("Manager", EMAIL, h, salt, "Ultra", time.time()))
        print("admin created:", EMAIL)
    c.commit()
finally:
    c.close()
