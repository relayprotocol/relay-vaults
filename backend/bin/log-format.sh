#!/bin/bash

# This script parse (ponder) json logs from pipe and update the "service" field
LOG_PREFIX=${SERVICE_NAME:-vaults-backend}

while IFS=$'\n' read -r line; do
    
    # If not valid JSON, output as is
    if ! echo "$line" | jq empty 2>/dev/null; then
        echo "$line"
        continue
    fi
    
    # if log already has a 'dd' field, output as is
    if $(echo $line | jq 'has("dd")'); then
        echo $line
        continue    
    fi

    # if no 'dd' field is present, replace ponder 'service' field
    if $(echo $line | jq 'has("service")'); then
        service="$LOG_PREFIX"
        internal_service="$(echo $line | jq -r '.service')"
        echo $line | jq -r --arg a "$service" --arg b "$internal_service" '.service = ($a) | .internal_service = ($b) | tostring' 
    fi
done
