"""Tier registry: resolution, fail-closed behaviour, cache."""
import os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
import tiers


def test_seed_has_three_tiers():
    tiers.ensure()
    assert {t["id"] for t in tiers.all_tiers()} == {"free", "pro", "ultra"}


def test_resolves_by_name_and_id():
    tiers.reload()
    assert tiers.resolve("Ultra")["id"] == "ultra"
    assert tiers.resolve("ultra")["id"] == "ultra"
    assert tiers.resolve("ULTRA")["id"] == "ultra"


def test_unknown_fails_closed_to_free():
    tiers.reload()
    for junk in ("Platinum", "", None, "free ", "999"):
        assert tiers.resolve(junk)["id"] == "free", junk


def test_council_and_refine_values():
    tiers.reload()
    assert tiers.resolve("Free")["council"] == 1
    assert tiers.resolve("Pro")["council"] == 2
    assert tiers.resolve("Ultra")["council"] == 3
    assert tiers.resolve("Free")["refine"] is False
    assert tiers.resolve("Ultra")["refine"] is True


def test_resolve_is_cheap_when_cached():
    tiers.reload()
    t0 = time.time()
    for _ in range(5000):
        tiers.resolve("Ultra")
    assert (time.time() - t0) < 1.0, "cached resolve too slow"


def test_reload_is_idempotent():
    tiers.ensure()
    before = len(tiers.all_tiers())
    tiers.reload(); tiers.reload()
    assert len(tiers.all_tiers()) == before == 3
