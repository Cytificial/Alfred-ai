"""v390: thin wrapper over existing research.py for the pipeline."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path: sys.path.insert(0, HERE)

def search(query, max_sources=4):
    """Return (text_block, sources_list). Uses existing research.py."""
    try:
        import research
        block, sources = research.web_research2(query)
        return block or "", (sources or [])[:max_sources]
    except Exception as e:
        print("[v390 search] fail:", e, flush=True)
        return "", []
