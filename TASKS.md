# Alfred — working backlog

## DONE
- [x] Password reveal on login/register (v197 was force-resetting field type every 400ms)
- [x] autocomplete attributes; remember-me checkbox id
- [x] Auth hardening: PBKDF2 outside global lock, failure-counter fix, max pw length,
      Secure cookie flag, logout-all endpoint, admin-email squatting blocked
- [x] Friendly auth error messages + shake + error slots in both forms
- [x] Blank body on reload: .views inline display:none repaired
- [x] Reload keeps current view: 4 chat-forcings neutralised, nav matched by data-view
- [x] Settings no longer opens Plans: duplicate Settings clones neutralised
- [x] Plans overlay: fixed top bar, Back button, Escape, full-viewport takeover
- [x] Plan card headings fixed (header plan-label sync was rewriting every card)
- [x] Tier registry backend/tiers.py: fail-closed resolve, audit trail, cached reads
- [x] GET /api/entitlements

## NOW — stage 3: registry becomes authoritative for enforcement
- [ ] Compare cfg["daily_caps"] vs tiers.daily_cap before switching (else admin caps go dead)
- [ ] Shadow mode: compute tier, log mismatch, change nothing
- [ ] council size from tier["council"] (replaces the 2 hardcoded dicts at 639 / 976)
- [ ] refine from tier["refine"] (replaces `plan == "Ultra"` at 132 / 677)
- [ ] base cap from tier row, PRESERVE plan_info bonus-credit maths
- [ ] unit tests: alias/name resolve, unknown->free, council/refine, cap parity, cache reload
- [ ] leave model chain + public_names on config for now

## ADMIN — admin@alfred.ai is the manager; fred@test.com is a normal user
- [ ] single require_admin() helper checking session email vs ALFRED_ADMIN_EMAIL
- [ ] audit admin.py _me() — make sure a normal session cannot reach admin routes
- [ ] admin_audit table: at, actor, action, target_type, target_id, ip, outcome, reason, before, after
      (tier change, credit change, delete, revoke, provider/model change)
- [ ] admin UI: tiers + audit tab; per-user tier/credits controls
- [ ] NO impersonation for now

## UX
- [ ] Greeting ONLY on a brand-new chat — never on an existing chat/project
- [ ] Header + its own icon change per tier (header becomes the tier's "place")
- [ ] Credits pill updates instantly after a message
- [ ] Header level glitching between pages
- [ ] Admin page fixes

## LATER
- [ ] Providers + models UI/UX
- [ ] Other sections needing work
- [ ] Real payments (explicit precedence vs admin override)
