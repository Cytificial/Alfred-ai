import json, os, sys, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
GEN  = os.path.join(ROOT, "assets", "gen")
os.makedirs(GEN, exist_ok=True)
brief = json.load(open(os.path.join(HERE, "brief.json")))
only = sys.argv[1] if len(sys.argv) > 1 else None

for it in brief["items"]:
    if only and it["id"] != only:
        continue
    out = os.path.join(GEN, it["id"] + ".png")
    if os.path.exists(out):
        print("skip", it["id"]); continue
    w, h = it["size"].split("x")
    q = urllib.parse.urlencode({"width": int(w), "height": int(h), "nologo": "true", "seed": 7})
    url = ("https://image.pollinations.ai/prompt/"
           + urllib.parse.quote(it["prompt"] + ", " + brief["style"]) + "?" + q)
    try:
        blob = urllib.request.urlopen(url, timeout=180).read()
        open(out, "wb").write(blob); print("saved", it["id"], len(blob), "bytes")
    except Exception as e:
        print("FAIL", it["id"], e)

files = sorted(f for f in os.listdir(GEN) if f.endswith(".png"))
html = ["<meta charset='utf-8'><body style='background:#060e1f;color:#cfe6ff;font:13px sans-serif;"
        "display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;padding:18px'>"]
for f in files:
    html.append("<figure style='margin:0'><img src='%s' style='width:100%%;border-radius:12px;"
                "border:1px solid #2b4a7a'><figcaption>%s</figcaption></figure>" % (f, f))
open(os.path.join(GEN, "index.html"), "w").write("".join(html))
print("gallery ready: http://127.0.0.1:8080/assets/gen/")
