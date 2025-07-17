#!/bin/bash

# This script parse (ponder) json logs from pipe and update the "service" field
LOG_PREFIX=${SERVICE_NAME:-vaults-backend}

# Function to convert log level to numeric value
get_level_label() {
    local numeric="$1"
    case "$numeric" in
        "10") echo "trace" ;;
        "20") echo "debug" ;;
        "30") echo "info" ;;
        "40") echo "warn" ;;
        "50") echo "error" ;;
        "60") echo "fatal" ;;
        *) echo "$numeric" ;; # Return original if not recognized
    esac
}

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
        # pino logger uses numeric level, so we need to convert it to a label
        level_numeric_value="$(echo $line | jq -r '.level')"
        level_label=$(get_level_label "$level_numeric_value")
        echo $line | jq -r --arg a "$service" --arg b "$internal_service" --arg c "$level_label" '.service = ($a) | .internal_service = ($b) | .level = ($c) | tostring'
    fi
done
