"""Smoke every brain.py route. Catches NameError/5xx, not auth states."""
import base64, json, os, uuid, urllib.request, urllib.error, pytest

BASE = os.environ.get("ALFRED_TEST_BASE", "http://127.0.0.1:8082")   # chat
AUTH = os.environ.get("ALFRED_TEST_AUTH", "http://127.0.0.1:8080")   # auth
NO_KEY = ("no engine key", "not configured")


def req(path, method="GET", body=None, token=None, timeout=45, base=None):
    url = (base or BASE) + path
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    r.add_header("Content-Type", "application/json")
    if token:
        r.add_header("X-Alfred-Token", token)
    try:
        with urllib.request.urlopen(r, timeout=timeout) as resp:
            return resp.status, resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


def ok(status, text):
    assert "is not defined" not in text, "NameError: " + text[:200]
    assert "Traceback" not in text, "Traceback leaked: " + text[:200]
    assert status < 500, "HTTP %s: %s" % (status, text[:200])
    if status == 503:
        assert any(k in text.lower() for k in NO_KEY), "odd 503: " + text[:200]


@pytest.fixture(scope="module")
def token():
    t = os.environ.get("ALFRED_TEST_TOKEN")
    if t:
        return t
    email = "ci-%s@test.local" % uuid.uuid4().hex[:8]
    creds = {"name": "CI Tester", "email": email, "password": "test1234"}
    s, b = req("/api/auth/register", "POST", creds, base=AUTH)
    if s >= 400:
        s, b = req("/api/auth/login", "POST",
                   {"email": email, "password": "test1234"}, base=AUTH)
    assert s == 200, "auth failed %s: %s" % (s, b[:200])
    d = json.loads(b)
    tok = d.get("token") or (d.get("user") or {}).get("token")
    assert tok, "no token in response: %s" % b[:200]
    return tok


def test_health():
    s, b = req("/health")
    assert s == 200 and json.loads(b).get("ok") is True


def test_plan_display_is_public():
    ok(*req("/api/plan-display"))


def test_requires_auth():
    s, b = req("/api/chats")
    assert s in (401, 403) or json.loads(b).get("ok") is False


def test_chats(token):
    ok(*req("/api/chats", token=token))


@pytest.mark.parametrize("q", ["hello", "alfred", "x"])
def test_chat_search(token, q):                     # WAS 500
    ok(*req("/api/chat/search?q=" + q, token=token))


def test_upload(token):                             # WAS 500
    ok(*req("/api/chat/upload", "POST", token=token, body={
        "filename": "smoke.txt",
        "content_b64": base64.b64encode(b"alfred smoke test").decode()}))


def test_engines(token):                            # WAS 500
    ok(*req("/api/engines", token=token))


def test_export_rejects_bad_id(token):              # WAS 500
    s, b = req("/api/chat/not-a-real-id/export", token=token)
    ok(s, b)
    assert s in (400, 404)


def test_chat(token):
    ok(*req("/api/chat", "POST", token=token,
            body={"message": "reply with the single word: ok"}))


def test_admin_denied_for_normal_user(token):
    s, b = req("/api/admin/stats", token=token)
    ok(s, b)
    assert s in (401, 403, 404)
