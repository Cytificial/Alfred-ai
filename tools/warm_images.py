import urllib.request, urllib.parse, time
BASE = "http://127.0.0.1:8080/api/image"
POSTS = [
  ("neon cyberpunk street after rain, wet asphalt reflections, cinematic", 31),
  ("astronaut on alien cliff watching violet nebula, cinematic", 12),
  ("holographic butterflies glowing garden at dusk, teal and magenta", 53),
  ("ancient grand library floating candles warm light, cinematic", 24),
  ("liquid chrome futuristic sports car at sunset, studio light", 66),
  ("floating islands golden sea of clouds, epic vista", 88),
  ("crystal dragon bioluminescent cave, teal glow", 45),
  ("bioluminescent whale gliding above a midnight city, volumetric fog", 31),
  ("crystal cathedral inside a glowing glacier, god rays, ultra detailed", 47),
  ("paper lanterns rising over terraced rice fields at dawn", 63),
  ("astronaut surfing a ring of golden stardust, cinematic", 79),
  ("aurora borealis over an ice cathedral, god rays, cinematic", 11),
  ("giant luminous whale swimming through clouds at dusk, photoreal fantasy", 108),
  ("train of glowing comets over a mountain lake, long exposure", 205),
  ("ancient temple floating above waterfalls, golden hour, epic vista", 302),
]
pending = list(POSTS)
for rnd in range(6):
    if not pending: break
    print("round", rnd + 1, "-", len(pending), "to warm", flush=True)
    nxt = []
    for prompt, seed in pending:
        url = BASE + "?prompt=" + urllib.parse.quote(prompt) + "&seed=" + str(seed)
        try:
            d = urllib.request.urlopen(url, timeout=180).read()
            print("  ok", len(d), "bytes -", prompt[:46], flush=True)
        except Exception:
            print("  later -", prompt[:46], flush=True); nxt.append((prompt, seed))
        time.sleep(1.5)
    pending = nxt
print("warm done" if not pending else "still cold: %d" % len(pending))
