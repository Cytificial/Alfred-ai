# usage: sh tools/topup.sh <email> <bonus-messages>
# sets the user's EXTRA messages for today, on top of their plan's daily credits
cd "$(dirname "$0")/.." || exit 1
[ -z "$2" ] && { echo "usage: sh tools/topup.sh <email> <bonus>"; exit 1; }
E=$(grep '^OWNER_EMAIL=' backend/keys.env | cut -d= -f2)
P=$(grep '^OWNER_PASS=' backend/keys.env | cut -d= -f2)
T=$(curl -s -H 'Content-Type: application/json' -d "{\"email\":\"$E\",\"password\":\"$P\"}" http://localhost:8080/api/auth/login | python3 -c 'import json,sys;print(json.load(sys.stdin).get("token",""))')
[ ${#T} -lt 20 ] && { echo "owner login failed"; exit 1; }
curl -s -H "X-Alfred-Token: $T" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$1\",\"extra\":$2}" http://localhost:8080/api/admin/credits/set; echo
