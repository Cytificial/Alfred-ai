"""v401: file upload handler. Stores in backend/uploads/, returns attachment IDs."""
import os, uuid, json, base64, re

HERE = os.path.dirname(os.path.abspath(__file__))
UPLOADS = os.path.join(HERE, "uploads")
os.makedirs(UPLOADS, exist_ok=True)

MAX_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_TEXT = {".txt", ".md", ".json", ".csv", ".py", ".js", ".ts", ".html", ".css",
                ".xml", ".yaml", ".yml", ".log", ".sh", ".sql", ".rs", ".go", ".java", ".c", ".cpp"}
ALLOWED_IMG = {".png", ".jpg", ".jpeg", ".gif", ".webp"}


def _ext(name):
    return os.path.splitext(name or "")[1].lower()


def save_file(filename, content_b64):
    """Save a base64-encoded file. Returns {ok, id, name, size, kind} or error."""
    try:
        raw = base64.b64decode(content_b64)
    except Exception:
        return {"ok": False, "error": "Invalid base64"}
    if len(raw) > MAX_SIZE:
        return {"ok": False, "error": "File too large (max 5 MB)"}

    ext = _ext(filename)
    if ext in ALLOWED_TEXT: kind = "text"
    elif ext in ALLOWED_IMG: kind = "image"
    else: return {"ok": False, "error": "Unsupported file type: " + ext}

    fid = uuid.uuid4().hex[:16]
    path = os.path.join(UPLOADS, fid + ext)
    with open(path, "wb") as f:
        f.write(raw)
    return {"ok": True, "id": fid, "name": filename, "size": len(raw), "kind": kind, "ext": ext}


def load_for_prompt(attachment_ids):
    """Load files as text for the LLM prompt. Images return a marker."""
    parts = []
    for fid in (attachment_ids or [])[:4]:
        try:
            matches = [f for f in os.listdir(UPLOADS) if f.startswith(fid)]
            if not matches: continue
            full = os.path.join(UPLOADS, matches[0])
            ext = _ext(matches[0])
            if ext in ALLOWED_TEXT:
                with open(full, "r", encoding="utf-8", errors="replace") as f:
                    txt = f.read(20000)
                parts.append(f"\n\n--- FILE: {matches[0]} ---\n{txt}\n--- END FILE ---")
            elif ext in ALLOWED_IMG:
                parts.append(f"\n\n[Image attached: {matches[0]}]")
        except Exception as e:
            print("[upload] load fail:", e, flush=True)
    return "\n".join(parts)
