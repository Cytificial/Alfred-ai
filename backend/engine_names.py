"""v404: public engine names. Users see friendly names only, never model IDs."""

PUBLIC_ENGINES = [
    {"id": "mini",     "label": "Astra mini",  "desc": "Fast, lightweight",              "levels": ["free","pro","ultra"]},
    {"id": "standard", "label": "Astra 6",     "desc": "Balanced intelligence",          "levels": ["free","pro","ultra"]},
    {"id": "pro",      "label": "Astra Pro",   "desc": "Deeper reasoning",               "levels": ["pro","ultra"]},
    {"id": "claude",   "label": "Claude",      "desc": "Long-form reasoning",            "levels": ["pro","ultra"]},
    {"id": "deepseek", "label": "DeepSeek",    "desc": "Code & structured reasoning",    "levels": ["pro","ultra"]},
    {"id": "council",  "label": "Council",     "desc": "Multiple minds, one answer",     "levels": ["pro","ultra"]},
    {"id": "deep",     "label": "Deep Think",  "desc": "Extended reasoning",             "levels": ["ultra"]},
]

EFFORT_LEVELS = ["fast", "balanced", "deep"]


def engines_for(plan):
    p = (plan or "Free").lower()
    return [e for e in PUBLIC_ENGINES if p in e["levels"]]


def resolve_engine(engine_id, chain):
    """Map a public engine ID to a real model, server-side only."""
    if not chain: return None
    eid = (engine_id or "").lower()
    if eid == "mini":     return chain[-1] if len(chain) > 1 else chain[0]
    if eid == "pro":      return chain[0] if len(chain) < 2 else chain[1]
    if eid == "deep":     return chain[0]
    if eid == "claude" and len(chain) > 1:   return chain[1]
    if eid == "deepseek" and len(chain) > 2: return chain[2]
    return chain[0]  # standard, council, or unknown
