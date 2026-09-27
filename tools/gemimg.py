import os, sys, json, base64, urllib.request, urllib.error

KEY   = os.environ.get("GOOGLE_API_KEY", "")
MODEL = os.environ.get("GEMIMG_MODEL", "gemini-3.1-flash-image")
URL   = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s"
ASPECT = {"1536x1024": "3:2", "1024x1536": "2:3", "1024x1024": "1:1"}
HERE  = os.path.dirname(os.path.abspath(__file__))
ROOT  = os.path.dirname(HERE)
GEN   = os.path.join(ROOT, "assets", "gen")

def call(prompt, aspect):
    cfg = {"responseModalities": ["IMAGE"]}
    if aspect:
        cfg["imageConfig"] = {"aspectRatio": aspect}
    body = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": cfg}
    r = urllib.request.Request(URL % (MODEL, KEY), data=json.dumps(body).encode(),
                               headers={"Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(r, timeout=300))
    for p in d["candidates"][0]["content"]["parts"]:
        if "inlineData" in p:
            return base64.b64decode(p["inlineData"]["data"])
    raise RuntimeError("no image returned: " + json.dumps(d)[:300])

def gen(prompt, aspect=None):
    try:
        return call(prompt, aspect)
    except urllib.error.HTTPError as e:
        print("  retry without imageConfig:", e.read().decode()[:160])
        return call(prompt, None)

if __name__ == "__main__":
    os.makedirs(GEN, exist_ok=True)
    brief = json.load(open(os.path.join(HERE, "brief.json")))
    only  = sys.argv[1] if len(sys.argv) > 1 else None
    for it in brief["items"]:
        if only and it["id"] != only:
            continue
        out = os.path.join(GEN, "gem-" + it["id"] + ".png")
        if os.path.exists(out):
            print("skip", it["id"]); continue
        try:
            blob = gen(it["prompt"] + ", " + brief["style"], ASPECT.get(it["size"]))
            open(out, "wb").write(blob); print("saved", out, len(blob), "bytes")
        except Exception as e:
            print("FAIL", it["id"], e)
