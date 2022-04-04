#!/bin/sh
set -e

if [ "$1" = "present" ]; then
    command -v tailscale
elif [ "$1" = "status" ]; then
    "$2" status --json
elif [ "$1" = "start" ]; then
    xdg-open -a 'Tailscale'
fi
