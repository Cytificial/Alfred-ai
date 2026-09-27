import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from genimg import post_headers, save_bytes   # written in step 5

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
GEN  = os.path.join(ROOT, "assets", "gen")
brief = json.load(open(os.path.join(HERE, "brief.json")))
only = sys.argv[1] if len(sys.argv) > 1 else None

for it in brief["items"]:
    if only and it["id"] != only:
        continue
    out = os.path.join(GEN, it["id"] + ".png")
    if os.path.exists(out):
        print("skip", it["id"]); continue
    prompt = it["prompt"] + ", " + brief["style"]
    try:
        blob = post_headers(prompt, it["size"])
        save_bytes(blob, out)
    except Exception as e:
        print("FAIL", it["id"], e)

# contact sheet so you can review all of them at once
files = sorted(f for f in os.listdir(GEN) if f.endswith(".png"))
html = ["<meta charset='utf-8'><body style='background:#060e1f;color:#cfe6ff;font:13px sans-serif;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;padding:18px'>"]
for f in files:
    html.append("<figure style='margin:0'><img src='%s' style='width:100%%;border-radius:12px;border:1px solid #2b4a7a'><figcaption>%s</figcaption></figure>" % (f, f))
open(os.path.join(GEN, "index.html"), "w").write("".join(html))
print("gallery:", os.path.join(GEN, "index.html"))
