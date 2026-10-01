"""v401: chat extras — search, edit-and-resend, export as markdown."""
import os, json, sqlite3, time

HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(HERE, "alfred.db")


def _db():
    c = sqlite3.connect(DB, timeout=10)
    c.row_factory = sqlite3.Row
    return c


def search_chats(uid, query, limit=20):
    """Full-text search over user's messages."""
    q = (query or "").strip()
    if len(q) < 2: return []
    like = "%" + q.replace("%", "\\%").replace("_", "\\_") + "%"
    c = _db()
    try:
        rows = c.execute("""
            SELECT DISTINCT h.id, h.title, h.updated,
                   (SELECT content FROM messages WHERE chat_id=h.id AND role='user' LIMIT 1) AS preview
            FROM chats h
            JOIN messages m ON m.chat_id = h.id
            WHERE h.user_id = ? AND m.content LIKE ? ESCAPE '\\'
            ORDER BY h.updated DESC LIMIT ?
        """, (uid, like, limit)).fetchall()
        return [{"id": r["id"], "title": r["title"], "updated": r["updated"], "preview": (r["preview"] or "")[:120]} for r in rows]
    finally:
        c.close()


def delete_after(uid, chat_id, message_id):
    """Delete all messages AFTER (inclusive) message_id in a chat the user owns."""
    c = _db()
    try:
        own = c.execute("SELECT id FROM chats WHERE id=? AND user_id=?", (chat_id, uid)).fetchone()
        if not own: return {"ok": False, "error": "not found"}
        msg = c.execute("SELECT id FROM messages WHERE id=? AND chat_id=?", (message_id, chat_id)).fetchone()
        if not msg: return {"ok": False, "error": "message not found"}
        c.execute("DELETE FROM messages WHERE chat_id=? AND id>=?", (chat_id, message_id))
        c.commit()
        return {"ok": True, "deleted_after": message_id}
    finally:
        c.close()


def export_chat(uid, chat_id):
    """Return chat as markdown text."""
    c = _db()
    try:
        ch = c.execute("SELECT id,title,created,updated FROM chats WHERE id=? AND user_id=?", (chat_id, uid)).fetchone()
        if not ch: return None
        msgs = c.execute(
            "SELECT role,content,ts FROM messages WHERE chat_id=? ORDER BY id ASC",
            (chat_id,)).fetchall()
        import datetime
        lines = ["# " + (ch["title"] or "Chat"),
                 "",
                 "_Exported from Alfred on " + datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC") + "_",
                 ""]
        for m in msgs:
            who = "**You**" if m["role"] == "user" else "**Alfred**"
            lines.append("### " + who)
            lines.append("")
            lines.append(m["content"] or "")
            lines.append("")
        return "\n".join(lines)
    finally:
        c.close()
