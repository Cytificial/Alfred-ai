import os, json, urllib.request, urllib.parse
from http.server import BaseHTTPRequestHandler, HTTPServer

KEY = os.environ.get("RECRAFT_API_KEY", "")

class H(BaseHTTPRequestHandler):
    def do_GET(self):
        q = urllib.parse.urlparse(self.path)
        if q.path != "/gen" or not KEY:
            self.send_error(404, "no key or bad path"); return
        prompt = urllib.parse.parse_qs(q.query).get("prompt", [""])[0]
        body = json.dumps({"model": "recraftv3", "style": "digital_illustration",
                           "size": "1024x1024", "prompt": prompt}).encode()
        r = urllib.request.Request("https://external.api.recraft.ai/v1/images/generations",
            data=body, headers={"Content-Type": "application/json",
                                "Authorization": "Bearer " + KEY})
        try:
            d = json.load(urllib.request.urlopen(r, timeout=180))
            url = (d.get("data") or [{}])[0].get("url")
            img = urllib.request.urlopen(url, timeout=180).read()
            self.send_response(200); self.send_header("Content-Type", "image/png")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(img))); self.end_headers()
            self.wfile.write(img)
        except Exception as e:
            self.send_error(500, str(e))
    def log_message(self, *a): pass

HTTPServer(("127.0.0.1", 8090), H).serve_forever()
