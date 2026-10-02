"""v406: public engine names — marketing names only. Never exposes model IDs."""

PUBLIC_ENGINES = [
    # Free tier
    {"id": "mini",     "label": "GPT-5 mini",       "desc": "Fast, lightweight",            "levels": ["free","pro","ultra"]},
    {"id": "standard", "label": "Claude Sonnet 4",  "desc": "Balanced intelligence",        "levels": ["free","pro","ultra"]},
    {"id": "dolphin",  "label": "Dolphin",          "desc": "Everyday assistance",          "levels": ["free","pro","ultra"]},
    # Pro tier (adds)
    {"id": "pro",      "label": "GPT-6 Astra",      "desc": "Frontier reasoning",           "levels": ["pro","ultra"]},
    {"id": "claude",   "label": "Claude Opus 5",    "desc": "Long-form reasoning",          "levels": ["pro","ultra"]},
    {"id": "deepseek", "label": "DeepSeek 4.1",     "desc": "Code & structured reasoning",  "levels": ["pro","ultra"]},
    {"id": "council",  "label": "Council",          "desc": "Multiple minds, one answer",   "levels": ["pro","ultra"]},
    {"id": "search",   "label": "Web Search",       "desc": "Real-time information",        "levels": ["pro","ultra"]},
    {"id": "code",     "label": "Code Interpreter", "desc": "Run code, analyze data",       "levels": ["pro","ultra"]},
    # Ultra tier (adds)
    {"id": "deep",     "label": "Deep-think Council", "desc": "Every mind, one answer",     "levels": ["ultra"]},
]

PLAN_META = {
    "Free": {
        "headline": "3 standard minds · to meet Alfred",
        "engine_ids": ["mini", "standard", "dolphin"],
    },
    "Pro": {
        "headline": "6 latest-generation minds · full speed",
        "engine_ids": ["pro", "claude", "deepseek", "dolphin", "council", "search", "code"],
    },
    "Ultra": {
        "headline": "4 apex minds + the Deep-think Council",
        "engine_ids": ["pro", "claude", "deepseek", "dolphin", "council", "deep", "search", "code"],
    },
}


def engines_for(plan):
    p = (plan or "Free").lower()
    return [e for e in PUBLIC_ENGINES if p in e["levels"]]


def plan_display(plan):
    meta = PLAN_META.get(plan) or PLAN_META["Free"]
    chips = []
    for eid in meta["engine_ids"]:
        for e in PUBLIC_ENGINES:
            if e["id"] == eid:
                chips.append({"label": e["label"], "desc": e["desc"]})
                break
    return {"headline": meta["headline"], "chips": chips}


def resolve_engine(engine_id, chain):
    if not chain: return None
    eid = (engine_id or "").lower()
    if eid == "mini":     return chain[-1] if len(chain) > 1 else chain[0]
    if eid == "dolphin":  return chain[-1] if len(chain) > 1 else chain[0]
    if eid == "pro":      return chain[0] if len(chain) < 2 else chain[1]
    if eid == "deep":     return chain[0]
    if eid == "claude" and len(chain) > 1:   return chain[1]
    if eid == "deepseek" and len(chain) > 2: return chain[2]
    return chain[0]
