#!/data/data/com.termux/files/usr/bin/sh
# v362: honest restarts - pidfiles + /proc cmdline validation (ss + /proc/net/tcp unavailable here)
cd "$(dirname "$0")/.."
kill_by() {
  f="backend/$1.pid"
  [ -f "$f" ] || return 0
  P=$(cat "$f")
  if [ -n "$P" ] && [ -r "/proc/$P/cmdline" ] && tr '\0' ' ' < "/proc/$P/cmdline" | grep -q "$2"; then
    kill "$P" 2>/dev/null; echo "killed $1 (pid $P)"
  else
    echo "stale pidfile $f (pid ${P:-?} not running $2) - ignored"
  fi
  rm -f "$f"
}
kill_by server "backend/server.py"
kill_by brain "backend/brain.py"
sleep 2
nohup python3 backend/server.py >> backend/engine.log 2>&1 & echo $! > backend/server.pid
nohup python3 backend/brain.py  >> backend/engine.log 2>&1 & echo $! > backend/brain.pid
sleep 4
echo "server pid $(cat backend/server.pid) | brain pid $(cat backend/brain.pid)"
curl -s -m 10 -o /dev/null http://127.0.0.1:8080/api/auth/me && echo "server :8080 responding"
curl -s -m 10 http://127.0.0.1:8082/health | head -c 60; echo
