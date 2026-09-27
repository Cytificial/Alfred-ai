# ALFRED — project map

alfred-ai/
├── index.html · css/ · js/ · assets/   ← FRONTEND (UI only, no secrets, ever)
├── backend/
│   ├── server.py   ← ONE process: serves the site on 8080 + /api/chat (Gemini) + /api/image
│   ├── keys.env    ← secrets. chmod 600. never referenced by frontend
│   └── README.md
└── tools/          ← dev scripts (image gen, design critic) — not part of the app

## Rules
- Edit the look/feel        → index.html, css/style.css, js/app.js
- Edit the brain/behavior   → backend/server.py
- Frontend talks to backend → fetch('/api/...') only. Keys stay server-side.

## Run
pkill -f http.server ; pkill -f server.py
python3 ~/alfred-ai/backend/server.py &
curl http://127.0.0.1:8080/api/health     # {"ok":true,"gemini_key":true}
