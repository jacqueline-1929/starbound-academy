#!/bin/bash
set -e
cd "$(dirname "$0")"

school_url="http://localhost:4173/"
if ! curl -fsS --max-time 2 "$school_url" >/dev/null 2>&1; then
  nohup python3 -m http.server 4173 --bind 127.0.0.1 --directory dist \
    >/tmp/starbound-academy-server.log 2>&1 </dev/null &
  for attempt in 1 2 3 4 5; do
    if curl -fsS --max-time 2 "$school_url" >/dev/null 2>&1; then break; fi
    sleep 1
  done
fi

if ! curl -fsS --max-time 2 "$school_url" | grep -q '<title>Starbound Academy</title>'; then
  echo "The school could not start at $school_url"
  echo "Check /tmp/starbound-academy-server.log or make sure port 4173 is free."
  read -r -p "Press Return to close this window."
  exit 1
fi

open "$school_url"
