"""v404: exponential backoff with jitter for provider calls."""
import time, random

RETRYABLE = ("429", "500", "502", "503", "504", "timed out", "timeout",
             "connection", "reset by peer", "temporary", "overloaded")


def with_backoff(fn, attempts=3, base=1.5, cap=8.0):
    last = None
    for i in range(attempts):
        try:
            return fn()
        except Exception as e:
            last = e
            msg = str(e).lower()
            if any(c in msg for c in ("401", "403", "404", "400", "invalid", "unauthorized")):
                raise
            if not any(m in msg for m in RETRYABLE):
                raise
            if i < attempts - 1:
                delay = min(cap, base * (2 ** i)) + random.uniform(0, 0.5)
                time.sleep(delay)
    raise last
