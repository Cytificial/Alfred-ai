import os

BUDGET = int(os.environ.get("ALFRED_TOKEN_BUDGET", "16000"))
NAMES = ("_route", "_or_chat", "_direct", "gemini")

def est(t):
    if isinstance(t, str):
        s = t
    elif isinstance(t, dict):
        s = str(t.get("role") or "") + str(t.get("content") or "")
    else:
        s = str(t)
    return max(1, len(s) // 4)

def budget(turns, system="", cap=None):
    cap = cap or BUDGET
    ts = list(turns or [])
    if not ts:
        return ts
    used = est(system)
    if used + sum(est(t) for t in ts) <= cap:
        return ts
    keep = [ts[-1]]
    used += est(ts[-1])
    for t in reversed(ts[:-1]):
        c = est(t)
        if used + c > cap:
            break
        keep.append(t)
        used += c
    keep.reverse()
    return keep

def install(g):
    for n in NAMES:
        if n in g:
            g["_tb_" + n] = g[n]
    for n in NAMES:
        if n not in g:
            continue
        def mk(n):
            def f(*a, **k):
                if len(a) > 3 and a[3]:
                    a = list(a)
                    a[3] = budget(a[3], a[2] if len(a) > 2 else "")
                return g["_tb_" + n](*a, **k)
            return f
        g[n] = mk(n)
    for m in ("react_pipeline", "tools_web", "council", "chat_extras"):
        try:
            mod = __import__(m)
        except Exception:
            continue
        for n in NAMES:
            if getattr(mod, n, None) is not None:
                setattr(mod, n, g[n])
    return True
