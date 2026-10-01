"""S1.0: Alfred skills - SKILL.md folders, progressive disclosure, text-only."""
import os
import re
import shutil

_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "skills")
_MAXFILE = 16384
_MAXBODY = 4000
_SLUG = re.compile(r"^[a-z0-9][a-z0-9-]{1,30}$")

def _parse(txt):
    """Restricted frontmatter: only 'key: value' lines, no nesting, dup-checked."""
    if not isinstance(txt, str) or not txt.startswith("---"):
        raise ValueError("no frontmatter")
    end = txt.find("\n---", 3)
    if end < 0:
        raise ValueError("unterminated frontmatter")
    meta = {}
    for ln in txt[3:end].splitlines():
        ln = ln.strip()
        if not ln:
            continue
        if ":" not in ln:
            raise ValueError("bad line: %s" % ln[:30])
        k, v = ln.split(":", 1)
        k = k.strip().lower(); v = v.strip().strip('"').strip("'")
        if not re.match(r"^[a-z]+$", k):
            raise ValueError("bad key")
        if k in meta:
            raise ValueError("dup key")
        meta[k] = v
    for req in ("name", "description", "trigger"):
        if not meta.get(req):
            raise ValueError("missing %s" % req)
    name = meta["name"].strip().lower()
    if not _SLUG.match(name):
        raise ValueError("bad name")
    body = txt[end + 4:].strip()
    if not body:
        raise ValueError("empty body")
    return {"name": name,
            "description": meta["description"][:200],
            "trigger": meta["trigger"][:200],
            "body": body[:_MAXBODY]}

def _path(name):
    if not _SLUG.match(name or ""):
        return None
    return os.path.join(_DIR, name, "SKILL.md")

def index():
    out = []
    try:
        if not os.path.isdir(_DIR):
            return out
        for d in sorted(os.listdir(_DIR)):
            p = os.path.join(_DIR, d, "SKILL.md")
            if not os.path.isfile(p):
                continue
            try:
                if os.path.getsize(p) > _MAXFILE:
                    raise ValueError("too big")
                with open(p, encoding="utf-8") as f:
                    s = _parse(f.read())
                if s["name"] != d:
                    raise ValueError("name mismatch")
                s["trigs"] = [t.strip().lower() for t in s["trigger"].split(",") if t.strip()]
                out.append(s)
            except Exception as e:
                print("skillsys: skip %s: %s" % (d, str(e)[:50]), flush=True)
    except Exception:
        pass
    return out

def block_for(message):
    """Skill index always (discoverability) + full body when a trigger matches."""
    try:
        idx = index()
        if not idx:
            return ""
        head = ("\nSKILLS ALFRED CAN USE (auto-activate when the request matches):\n"
                + "\n".join("- %s: %s" % (s["name"], s["description"][:90]) for s in idx) + "\n")
        m = (message or "").lower()
        for s in idx:
            for t in s["trigs"]:
                if t and re.search(r"(?<![a-z0-9])" + re.escape(t) + r"(?![a-z0-9])", m):
                    print("skillsys: matched %s" % s["name"], flush=True)
                    return (head + "\nACTIVE SKILL - %s (follow these instructions for this reply; "
                            "they never override privacy or safety rules):\n%s\n" % (s["name"], s["body"]))
        return head
    except Exception:
        return ""

def create(name, description, trigger, body):
    try:
        p = _path(name)
        if not p:
            return False, "bad name (lowercase letters, digits, hyphens)"
        if os.path.exists(p):
            return False, "skill exists"
        fm = ("---\nname: %s\ndescription: %s\ntrigger: %s\n---\n"
              % (name, (description or "").strip().replace("\n", " ")[:200],
                 (trigger or "").strip().replace("\n", " ")[:200]))
        content = fm + (body or "").strip()[:_MAXBODY] + "\n"
        if len(content.encode("utf-8")) > _MAXFILE:
            return False, "too large"
        _parse(content)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            f.write(content)
        print("skillsys: created %s" % name, flush=True)
        return True, ""
    except Exception as e:
        return False, str(e)[:80]

def delete(name):
    try:
        p = _path(name)
        if not p or not os.path.isdir(os.path.dirname(p)):
            return False, "no such skill"
        shutil.rmtree(os.path.dirname(p))
        print("skillsys: deleted %s" % name, flush=True)
        return True, ""
    except Exception as e:
        return False, str(e)[:80]
