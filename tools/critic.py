import os, sys, json, base64, urllib.request

KEY   = os.environ["GOOGLE_API_KEY"]
MODEL = sys.argv[3] if len(sys.argv) > 3 else "gemini-2.5-pro"
URL   = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s"

def part(path):
    mime = "image/png" if path.lower().endswith(".png") else "image/jpeg"
    data = base64.b64encode(open(path, "rb").read()).decode()
    return {"inlineData": {"mimeType": mime, "data": data}}

PROMPT = (
 "You are a senior product designer reviewing a build against a target. "
 "Image 1 = TARGET design. Image 2 = CURRENT build. "
 "Output a numbered list (max 15, most impactful first) of concrete, implementable changes. "
 "For EACH item give exact values: hex colours, px spacing/size/border-radius, blur px, opacity, "
 "font size/weight, and tag it layout / colour / typography / lighting / motion. "
 "No praise, no summary, no fluff."
)

body = {"contents": [{"parts": [{"text": PROMPT}, part(sys.argv[1]), part(sys.argv[2])]}],
        "generationConfig": {"temperature": 0.2}}
r = urllib.request.Request(URL % (MODEL, KEY), data=json.dumps(body).encode(),
                           headers={"Content-Type": "application/json"})
d = json.load(urllib.request.urlopen(r, timeout=300))
print(d["candidates"][0]["content"]["parts"][0]["text"])
