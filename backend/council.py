"""v404: multi-model council — parallel answers + synthesis.
Makes the Pro/Ultra 'multiple minds work together' claim real.
Never exposes model IDs to the client."""
from concurrent.futures import ThreadPoolExecutor, as_completed

SYNTH_SYS = """You are Alfred's synthesis engine. Multiple AI minds have answered the same question.

Merge their responses into ONE clean, accurate answer.

Rules:
- No preamble. Answer the user directly.
- If models agree: state confidently.
- If they disagree: prefer the more specific/accurate, briefly note uncertainty.
- Never mention models, providers, or that there were multiple responses.
- Keep the format of the best response."""


def run_council(models, call_fn, system, turns, timeout=60):
    results = [None] * len(models)
    def job(i, m):
        try:
            a = call_fn(m, system, turns)
            results[i] = {"index": i, "answer": a or "", "error": None}
        except Exception as e:
            results[i] = {"index": i, "answer": "", "error": str(e)[:120]}
    with ThreadPoolExecutor(max_workers=len(models)) as ex:
        futs = [ex.submit(job, i, m) for i, m in enumerate(models)]
        try:
            for f in as_completed(futs, timeout=timeout):
                f.result()
        except Exception:
            pass
    return [r for r in results if r]


def build_synth_prompt(message, results):
    parts = ["Question: " + message, "", "Responses from multiple AI minds:"]
    for i, r in enumerate(results):
        tag = "OK" if r.get("answer") else "FAILED"
        parts.append(f"\n--- Response {i+1} [{tag}] ---")
        parts.append(r.get("answer") or r.get("error") or "")
    parts.append("\n--- END ---")
    return "\n".join(parts)
