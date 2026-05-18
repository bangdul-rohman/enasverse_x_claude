#!/bin/bash
TOKEN="7a5a02cd-0f60-4983-8b8b-92695d275102"
RESULT=$(curl -s --request POST --url https://backboard.railway.com/graphql/v2 \
  --header "Authorization: Bearer $TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"query":"query { deployments(first: 3, input: { projectId: \"4a389b14-e1b7-4168-b700-ae50f86fb408\", environmentId: \"a3fa81c5-5875-43a9-9773-a9dd9909cecc\", serviceId: \"714eb993-3e99-4dc4-81d8-a81603668bb1\" }) { edges { node { id status createdAt } } } }"}')
echo $RESULT | python3 -c "
import json,sys
d = json.load(sys.stdin)
for e in d['data']['deployments']['edges']:
    n = e['node']
    status = n['status']
    icon = '✅' if status == 'SUCCESS' else '❌' if status == 'FAILED' else '🔄'
    print(f\"{icon} {status} — {n['createdAt'][:19]}\")
"
