#!/usr/bin/env python3
"""ALFRED Inspiration Engine v79 - polite mode.
Drops 2 posts every 2h. Images warm through /api/image cache, but a cold
image NEVER blocks the feed - backfill retries it every cycle."""
import json, os, sys, time, random, hashlib, atexit
import urllib.request, urllib.parse

HERE  = os.path.dirname(os.path.abspath(__file__))
FEED  = os.path.join(HERE, "explore.json")
STATE = os.path.join(HERE, "engine_state.json")
LOCKF = os.path.join(HERE, "engine.lock")
BASE  = "http://127.0.0.1:8080"
EVERY, CHECK = 2 * 3600, 600

SUBJ = ["a lighthouse made of glass", "a fox with constellation fur", "an abandoned greenhouse on Mars",
  "a piano floating in a calm ocean", "a treehouse city in giant redwoods", "a samurai in a neon rain-soaked alley",
  "a hot air balloon made of autumn leaves", "a whale swimming through a sky of wheat fields", "a clockwork owl on a bookshop sign",
  "a library inside a cave of glowing crystals", "a paper boat crossing a sea of stars", "a robot gardener tending cherry blossoms",
  "a dragon curled around a snowy peak", "a quiet train station on a ring of Saturn"]
SETT = ["at golden hour", "under a violet aurora", "in dense morning fog", "during a meteor shower",
  "at blue hour in light rain", "beneath twin moons", "inside a bioluminescent forest",
  "on a frozen lake at sunrise", "in a field of glowing flowers", "under heavy monsoon clouds"]
MOOD = ["photorealistic, cinematic, volumetric light", "studio quality, ultra detailed, soft glow",
  "epic wide shot, dramatic sky, subtle film grain", "dreamy pastel palette, soft focus",
  "moody teal and orange grade", "crisp air, high detail, natural light",
  "dark fantasy, ember particles, dramatic shadows", "warm nostalgic film look, 35mm"]
NAMES = ["Nova","Kai","Vega","Rin","Mora","Juno","Ash","Umi","Sol","Hana","Vero","Lia","Orion","Iris",
  "Zephyr","Cleo","Atlas","Luna","Echo","Ivy","Rune","Sable","Nyx","Koda","Wren","Aria","Dune","Fable","Cosmo","Ember"]

def single():
    if os.path.exists(LOCKF):
        try:
            pid = int(open(LOCKF).read().strip() or 0); os.kill(pid, 0)
            print("engine already running - exit"); sys.exit(0)
        except Exception: pass
    open(LOCKF, "w").write(str(os.getpid()))
    atexit.register(lambda: os.path.exists(LOCKF) and os.remove(LOCKF))

def load_state():
    try: return json.load(open(STATE))
    except Exception: return {"last": 0, "used": [], "drops": 0, "pending": [], "names": []}
def save_state(st):
    tmp = STATE + ".tmp"; open(tmp, "w").write(json.dumps(st)); os.replace(tmp, STATE)
def load_feed():
    try: return json.load(open(FEED))
    except Exception: return []
def append_feed(posts):
    data = load_feed() + posts
    tmp = FEED + ".tmp"; open(tmp, "w").write(json.dumps(data[-60:])); os.replace(tmp, FEED)

def warm_once(prompt, seed):
    """ONE attempt. Returns True/False. The server cache remembers successes forever."""
    try:
        u = BASE + "/api/image?prompt=" + urllib.parse.quote(prompt) + "&seed=" + str(seed % 9999)
        d = urllib.request.urlopen(u, timeout=120).read()
        ok = bool(d) and len(d) > 5000
        print("  warm", "ok %d bytes" % len(d) if ok else "tiny/bad", flush=True)
        return ok
    except Exception as e:
        print("  warm fail:", str(e)[:60], flush=True)
        return False

def drop():
    st = load_state(); used = set(st.get("used", []))
    names = st.get("names", [])
    fresh = [n for n in NAMES if n not in names] or NAMES   # never reuse a name until pool cycles
    posts, failed, made = [], [], 0
    local_subj = set()
    while made < 2:
        subj = random.choice(SUBJ)
        if subj in local_subj: continue                     # two works in one drop never share a subject
        p = subj + ", " + random.choice(SETT) + " - " + random.choice(MOOD)
        h = hashlib.md5(p.encode()).hexdigest()
        if h in used: continue
        used.add(h); local_subj.add(subj)
        seed = random.randint(1, 9999)
        if not warm_once(p, seed): failed.append({"prompt": p, "seed": seed})
        posts.append({"id": "e%s%d" % (hashlib.md5((p + str(time.time())).encode()).hexdigest()[:8], made),
                      "ts": int(time.time() * 1000) + made,
                      "kind": "video" if random.random() < 0.2 else "image",
                      "prompt": p, "seed": seed, "by": fresh[made % len(fresh)],
                      "origin": "engine", "likes": random.randint(25, 460)})
        made += 1
        time.sleep(5)
    append_feed(posts)                                  # feed NEVER waits for images
    st.update(last=time.time(), used=list(used)[-400:], drops=st.get("drops", 0) + 1,
              pending=(st.get("pending", []) + failed)[-30:], names=(names + [posts[i]["by"] for i in range(len(posts))])[-24:])
    save_state(st)
    print("drop #%d: +2 posts (feed=%d, cold=%d)" % (st["drops"], len(load_feed()), len(failed)), flush=True)

def backfill(st):
    """Retry cold images, one per cycle, with a 60s cooldown after any 429."""
    pend = st.get("pending", [])
    if not pend: return
    item = pend[0]
    if warm_once(item["prompt"], item["seed"]):
        st["pending"] = pend[1:]
    else:
        st["pending"] = pend[1:] + [pend[0]]            # rotate to the back
        time.sleep(60)                                  # respect the rate limit
    save_state(st)

single()
print("engine v79 up - pid", os.getpid(), flush=True)
while True:
    st = load_state()
    if time.time() - st.get("last", 0) >= EVERY: drop()
    else: backfill(st)
    time.sleep(CHECK)
