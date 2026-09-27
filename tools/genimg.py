import os, json, base64, urllib.request

def _call(url, headers, body):
    r = urllib.request.Request(url, data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", **headers})
    return json.load(urllib.request.urlopen(r, timeout=180))

def post_headers(prompt, size="1024x1024"):
    d = _call("https://external.api.recraft.ai/v1/images/generations",
              {"Authorization": "Bearer " + os.environ["RECRAFT_API_KEY"]},
              {"model": "recraftv3", "style": "digital_illustration",
               "size": size, "prompt": prompt})
    item = (d.get("data") or [{}])[0]
    if item.get("b64_json"):
        return base64.b64decode(item["b64_json"])
    return urllib.request.urlopen(item["url"], timeout=180).read()

def save_bytes(blob, path):
    open(path, "wb").write(blob); print("saved", path, len(blob), "bytes")
