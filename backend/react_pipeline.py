"""v390: ReAct pipeline — router decides, then search, then reason, then answer."""
import json, re, os, time

HERE = os.path.dirname(os.path.abspath(__file__))

# ---------- Router prompt ----------
ROUTER_SYS = """You are a silent routing brain. Given a user message, output ONLY compact JSON (no prose, no markdown):
{"search": true|false, "complex": true|false, "topic": "one short topic word or empty"}
Rules:
- search: true only if the answer needs current facts, prices, news, releases, sports scores, or fresh web data.
- complex: true if the question needs multi-step reasoning, math, code design, comparison, or planning.
- Never add commentary. Output only the JSON object."""

def _extract_json(s):
    s = (s or "").strip()
    # trim code fences if present
    s = re.sub(r"^```[a-z]*\n?", "", s); s = re.sub(r"\n?```$", "", s)
    m = re.search(r"\{.*\}", s, re.S)
    if not m: return {}
    try: return json.loads(m.group(0))
    except Exception: return {}

def route(message, call_model, chain):
    """Ask the smallest chain model to classify. Falls back gracefully."""
    if not call_model or not chain: return {"search": False, "complex": False}
    # use the last model in the chain (usually fastest/smallest) for the router
    m = chain[-1] if len(chain) > 1 else chain[0]
    try:
        out = call_model(m, ROUTER_SYS, [("user", message[:1200])])
        j = _extract_json(out)
        return {
            "search": bool(j.get("search")),
            "complex": bool(j.get("complex")),
            "topic": str(j.get("topic") or "")[:60],
        }
    except Exception as e:
        print("[v390 router] fail-open:", e, flush=True)
        return {"search": False, "complex": False}

# ---------- Reasoning prompt ----------
THINK_SYS = """You are Alfred's inner mind. Think through the user's question carefully and produce a private reasoning trace.

Rules:
- Write in plain text, no markdown headers.
- 3 to 8 short steps. Each step on its own line, prefixed with a bullet •.
- Include: what the user really wants, what facts are needed, any pitfalls, the plan.
- Do NOT produce the final answer. Only the reasoning.
- If web research was provided, use it. Cite sources inline as [1], [2] in your reasoning.
- Keep the whole trace under 200 words."""

def reason(message, research_block, memory_block, skill_block, call_model, chain):
    """Produce a reasoning trace using the middle of the chain."""
    if not call_model or not chain: return ""
    m = chain[len(chain)//2] if len(chain) > 1 else chain[0]
    ctx = ""
    if research_block: ctx += "\n\n" + research_block
    if memory_block:   ctx += "\n\n" + memory_block
    if skill_block:    ctx += "\n\n" + skill_block
    try:
        out = call_model(m, THINK_SYS + ctx, [("user", message)])
        return (out or "").strip()[:1400]
    except Exception as e:
        print("[v390 reason] fail:", e, flush=True)
        return ""

# ---------- Synthesizer prompt wrapper ----------
def build_answer_system(base_system, reasoning, research_block):
    """Wrap the base persona prompt with reasoning + research context."""
    parts = [base_system]
    if reasoning:
        parts.append(
            "You have already reasoned about this. Here is your reasoning trace:\n"
            + reasoning +
            "\n\nNow produce the final answer. Do not repeat the reasoning. Do not mention this trace. "
            "Answer directly and clearly."
        )
    if research_block:
        parts.append(research_block)
    return "\n\n".join(parts)
