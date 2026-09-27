import os, json, urllib.request, urllib.error
KEY = os.environ["GOOGLE_API_KEY"]
MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite",
          "gemini-2.5-flash-image", "gemini-3.1-flash-lite-image",
          "gemini-3.1-flash-image", "gemini-3-pro-image"]

def hit(model, body):
    u = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s" % (model, KEY)
    r = urllib.request.Request(u, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    try:
        return 200, json.load(urllib.request.urlopen(r, timeout=120))
    except urllib.error.HTTPError as e:
        try:    return e.code, json.loads(e.read().decode() or "{}")
        except Exception: return e.code, {}

for m in MODELS:
    body = {"contents": [{"parts": [{"text": "a single glowing blue star on black"}]}]}
    if "image" in m:
        body["generationConfig"] = {"responseModalities": ["IMAGE"]}
    code, d = hit(m, body)
    print("%-30s %s  %s" % (m, code, (d.get("error") or {}).get("message", "")[:80]))
