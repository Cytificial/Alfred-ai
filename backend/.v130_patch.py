# ===== v130: M2 living brain (SSE streaming + thinking-model budget) =====
def _v130_install():
    GEM_MAXTOK = 4096

    def _gemini_v130(model, key, system, turns):
        url = "https://generativelanguage.googleapis.com/v1beta/models/" + \
              urllib.parse.quote(model, safe="") + ":generateContent?" + \
              urllib.parse.urlencode({"key": key})
        contents = [{"role": role, "parts": [{"text": text}]} for role, text in turns]
        payload = {"systemInstruction": {"parts": [{"text": system}]}, "contents": contents,
                   "generationConfig": {"temperature": 0.8, "maxOutputTokens": GEM_MAXTOK}}
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"),
                                     headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=90) as r:
            data = json.loads(r.read().decode("utf-8"))
        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        text = "".join(p.get("text", "") for p in parts if p.get("text") and not p.get("thought")).strip()
        if not text:
            raise RuntimeError("Provider returned an empty answer")
        return text

    globals()["gemini"] = _gemini_v130      # upgrades the normal /api/chat path too

    def _sse_out(h, obj):
        h.wfile.write(b"data: " + json.dumps(obj, ensure_ascii=False).encode("utf-8") + b"\n\n")
        h.wfile.flush()

    def _chat_stream(handler, user):
        data = handler.body()
        message = str(data.get("message") or "").strip()
        if not message:
            handler.json_out(400, {"ok": False, "error": "Write a message first."}); return
        if len(message) > 12000:
            handler.json_out(400, {"ok": False, "error": "That message is too long."}); return
        cfg = config()
        if cfg.get("stream") is False:
            handler.json_out(501, {"ok": False, "error": "Streaming disabled."}); return
        key = api_key(cfg); chain = cfg.get("chain") or []
        if not key or not chain:
            handler.json_out(503, {"ok": False, "error": "No engine key configured yet."}); return

        uid = user["_uid"]; plan, cap = handler.plan_info(user, cfg)
        today, now = day_utc(), time.time()
        limit = max(1, int(cfg.get("minute_limit", 6)))
        context_count = max(2, min(40, int(cfg.get("context_messages", 12))))
        chat_id = data.get("chat_id")
        if chat_id not in (None, ""):
            try: chat_id = int(chat_id)
            except (TypeError, ValueError):
                handler.json_out(400, {"ok": False, "error": "Invalid chat id."}); return

        c = db()
        try:
            c.execute("BEGIN IMMEDIATE")
            used = c.execute("SELECT count FROM usage WHERE user_id=? AND day=?", (uid, today)).fetchone()
            used = int(used["count"]) if used else 0
            if used >= cap:
                c.rollback()
                handler.json_out(429, {"ok": False, "error":
                    "You have used all %d messages for today on the %s plan. Your mind rests until midnight - or upgrade in Plans." % (cap, plan)})
                return
            recent = c.execute(
                "SELECT COUNT(*) AS n FROM messages m JOIN chats h ON h.id=m.chat_id "
                "WHERE h.user_id=? AND m.role='user' AND m.ts>?", (uid, now - 60)).fetchone()["n"]
            if recent >= limit:
                c.rollback()
                handler.json_out(429, {"ok": False, "error": "One moment - you are sending faster than I can think."})
                return
            if chat_id is None:
                cur = c.execute("INSERT INTO chats(user_id,title,created,updated) VALUES(?,?,?,?)",
                                (uid, message[:48], now, now))
                chat_id = cur.lastrowid
            else:
                owns = c.execute("SELECT id FROM chats WHERE id=? AND user_id=?", (chat_id, uid)).fetchone()
                if not owns:
                    c.rollback(); handler.json_out(404, {"ok": False, "error": "Chat not found."}); return
            c.execute("INSERT INTO messages(chat_id,role,content,ts) VALUES(?,?,?,?)", (chat_id, "user", message, now))
            c.execute("UPDATE chats SET updated=? WHERE id=?", (now, chat_id))
            c.execute("INSERT INTO usage(user_id,day,count) VALUES(?,?,1) "
                      "ON CONFLICT(user_id,day) DO UPDATE SET count=count+1", (uid, today))
            rows = c.execute("SELECT role,content FROM messages WHERE chat_id=? ORDER BY id DESC LIMIT ?",
                             (chat_id, context_count)).fetchall()
            c.commit()
        finally:
            c.close()

        turns = [("model" if r["role"] == "assistant" else "user", r["content"]) for r in reversed(rows)]

        handler.send_response(200)
        handler.cors_headers()
        handler.send_header("Content-Type", "text/event-stream; charset=utf-8")
        handler.send_header("Cache-Control", "no-store")
        handler.send_header("Connection", "close")
        handler.end_headers()
        handler.close_connection = True
        _sse_out(handler, {"chat_id": chat_id})

        full, broken = [], False
        for model in chain:
            try:
                url = ("https://generativelanguage.googleapis.com/v1beta/models/" +
                       urllib.parse.quote(model, safe="") +
                       ":streamGenerateContent?alt=sse&" + urllib.parse.urlencode({"key": key}))
                contents = [{"role": role, "parts": [{"text": text}]} for role, text in turns]
                payload = {"systemInstruction": {"parts": [{"text": persona(user.get("name"))}]},
                           "contents": contents,
                           "generationConfig": {"temperature": 0.8, "maxOutputTokens": GEM_MAXTOK}}
                req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"),
                                             headers={"Content-Type": "application/json"}, method="POST")
                with urllib.request.urlopen(req, timeout=180) as up:
                    for raw in up:
                        line = raw.decode("utf-8", "replace").strip()
                        if not line.startswith("data:"):
                            continue
                        try:
                            chunk = json.loads(line[5:].strip())
                        except Exception:
                            continue
                        cand = (chunk.get("candidates") or [{}])[0]
                        for p in (cand.get("content") or {}).get("parts", []):
                            t = p.get("text")
                            if t and not p.get("thought"):
                                full.append(t)
                                _sse_out(handler, {"t": t})
                break
            except (BrokenPipeError, ConnectionResetError, OSError):
                broken = True; break
            except Exception as e:
                print("stream model %s failed: %s" % (model, str(e)[:180]), flush=True)
                continue

        answer = "".join(full).strip()
        if answer:
            with db() as c:
                c.execute("INSERT INTO messages(chat_id,role,content,ts) VALUES(?,?,?,?)",
                          (chat_id, "assistant", answer, time.time()))
                c.execute("UPDATE chats SET updated=? WHERE id=?", (time.time(), chat_id))
        if not broken:
            if not answer:
                try: _sse_out(handler, {"error": "My engines are catching their breath - try again in a moment."})
                except Exception: pass
            public = (cfg.get("public_names") or {}).get(plan, "Alfred")
            try:
                _sse_out(handler, {"done": True, "chat_id": chat_id, "model": public,
                                   "remaining": max(0, cap - used - 1)})
            except Exception: pass

    _orig_route = Handler.route

    def _route_v130(self):
        try:
            if self.command == "POST" and urllib.parse.urlparse(self.path).path == "/api/chat/stream":
                if not self.origin_ok(): return
                user = self.require_user()
                if not user: return
                _chat_stream(self, user); return
        except ValueError as e:
            try: self.json_out(400, {"ok": False, "error": str(e)})
            except Exception: self.close_connection = True
            return
        except (BrokenPipeError, ConnectionResetError):
            self.close_connection = True; return
        except Exception:
            traceback.print_exc()
            try: self.json_out(500, {"ok": False, "error": "Alfred hit a snag. Please try again."})
            except Exception: self.close_connection = True
            return
        return _orig_route(self)

    Handler.route = _route_v130
    Handler.do_GET = _route_v130
    Handler.do_POST = _route_v130
    Handler.do_DELETE = _route_v130

try:
    _v130_install()
except Exception:
    traceback.print_exc()
