"""v469: no admin response may ever carry a secret."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
import admin

FAKE = "AQ.AAfakekeyDONTSHIP0000000000000000000"


def test_redacts_flat_key():
    out = admin._safe({"gemini_key": FAKE, "id": "gemini", "models": 12})
    assert out["gemini_key"] == "[REDACTED]"
    assert FAKE not in str(out)
    assert out["models"] == 12


def test_redacts_nested_and_lists():
    out = admin._safe({"providers": [{"api_key": FAKE, "name": "x"}],
                       "cfg": {"google_key": FAKE}})
    blob = str(out)
    assert FAKE not in blob, blob
    assert out["providers"][0]["name"] == "x"


def test_redacts_embedded_json_string():
    out = admin._safe({"raw": '{"gemini_key": "%s"}' % FAKE})
    assert FAKE not in str(out)


def test_keeps_harmless_fields():
    out = admin._safe({"email": "a@b.co", "plan": "Pro", "daily_caps": {"Pro": 120}})
    assert out["email"] == "a@b.co"
    assert out["daily_caps"]["Pro"] == 120
