#!/bin/bash

# This script reads input from pipe and update json "service" field with a prefix
LOG_PREFIX="vaults-backend-$1"

while IFS=$'\n' read -r line; do
    # add prefix to service field
    service="$LOG_PREFIX$(echo $line | jq -r '.service')"
    echo $line | jq -r --arg a "$service" '.service = ($a) | tostring' 
done
