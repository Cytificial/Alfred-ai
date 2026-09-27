"""v232: provider registry — multi-provider models, scan, plan tiers."""
import json, os, ipaddress, socket, urllib.request, urllib.parse
HERE = os.path.dirname(os.path.abspath(__file__))
CFG  = os.path.join(HERE, "providers.json")
KEYS = os.path.join(HERE, "providers_keys.json")   # gitignored, chmod 600

def _load():
    try: return json.load(open(CFG))
    except Exception: return {"providers": [], "chains": {"Free": [], "Pro": [], "Ultra": []}, "tiers": {}}
def _keys():
    try: return json.load(open(KEYS))
    except Exception: return {}
def _save(c):
    t = CFG + ".tmp"; open(t, "w").write(json.dumps(c, indent=1)); os.replace(t, CFG)
def _savekeys(k):
    t = KEYS + ".tmp"; open(t, "w").write(json.dumps(k)); os.replace(t, KEYS); os.chmod(KEYS, 0o600)

def public():
    c = _load(); keys = _keys(); out = []
    for p in c["providers"]:
        q = dict(p); q["configured"] = bool(keys.get(p["id"])); q.pop("api_key", None); out.append(q)
    return {"ok": True, "providers": out, "chains": c.get("chains", {}), "tiers": c.get("tiers", {})}

def _safe_url(u):
    try:
        h = urllib.parse.urlparse(u).hostname or ""
        if h == "localhost" or h.endswith(".local"): return False
        a = ipaddress.ip_address(socket.gethostbyname(h))
        return not (a.is_private or a.is_loopback or a.is_link_local or a.is_reserved)
    except Exception: return False

def add(pid, ptype, base_url, api_key):
    pid = str(pid).strip().lower()
    if not pid or not all(ch.isalnum() or ch in "-_" for ch in pid): raise ValueError("bad id")
    if ptype not in ("google", "openai", "openrouter"): raise ValueError("type: google|openai|openrouter")
    if not _safe_url(base_url): raise ValueError("base_url blocked (private/invalid)")
    c = _load()
    c["providers"] = [p for p in c["providers"] if p["id"] != pid]
    c["providers"].append({"id": pid, "type": ptype, "base_url": base_url.rstrip("/"), "enabled": True})
    _save(c)
    if api_key:
        k = _keys(); k[pid] = str(api_key); _savekeys(k)
    return True

def scan(pid):
    c = _load(); p = [x for x in c["providers"] if x["id"] == pid]
    if not p: raise ValueError("no such provider")
    p = p[0]; k = _keys().get(pid, ""); models = []
    if p["type"] == "google":
        req = urllib.request.Request(p["base_url"] + "/models?key=" + urllib.parse.quote(k))
        d = json.load(urllib.request.urlopen(req, timeout=25))
        for m in d.get("models", []):
            mid = m.get("name", "").replace("models/", "")
            if "generateContent" in (m.get("supportedGenerationMethods") or []):
                models.append({"id": mid, "name": m.get("displayName", mid), "free": False})
    elif p["type"] == "openai":
        req = urllib.request.Request(p["base_url"] + "/models", headers={"Authorization": "Bearer " + k})
        d = json.load(urllib.request.urlopen(req, timeout=25))
        for m in d.get("data", []): models.append({"id": m.get("id"), "name": m.get("id"), "free": ":free" in (m.get("id") or "")})
    else:  # openrouter
        d = json.load(urllib.request.urlopen(p["base_url"] + "/models", timeout=25))
        for m in d.get("data", []):
            models.append({"id": m.get("id"), "name": m.get("name") or m.get("id"),
                           "free": str((m.get("pricing") or {}).get("prompt", "1")) == "0"})
    c.setdefault("tiers", {})[pid] = models
    _save(c)
    return models

def chains(plan, refs):
    c = _load(); c.setdefault("chains", {})[plan] = [str(r) for r in refs][:6]; _save(c); return True

def chains_for(plan):
    c = _load(); order = ["Free", "Pro", "Ultra"]; i = order.index(plan if plan in order else "Free")
    for p in order[i:]:
        ch = c.get("chains", {}).get(p) or []
        if ch: return ch
    return []
