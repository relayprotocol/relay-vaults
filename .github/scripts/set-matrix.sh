#!/bin/bash

set -euo pipefail

# Initialize array with base folders
folders=('smart-contracts' 'backend' 'claimer')

# Add all packages
if [ -d "packages" ]; then
  echo "Adding packages..." >&2
  
  for package_json in packages/*/package.json; do
    if [ -f "$package_json" ]; then
      dir=$(dirname "$package_json")
      folders+=("$dir")
      echo "✓ Added: $dir" >&2
    fi
  done
else
  echo "No packages directory found" >&2
fi

# Convert array to JSON format
json_array=$(printf '%s\n' "${folders[@]}" | jq -R . | jq -s -c .)

# Output for GitHub Actions
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "matrix=${json_array}" >> "$GITHUB_OUTPUT"
  echo "Successfully wrote to GITHUB_OUTPUT" >&2
else
  echo "[LOCAL] Would set matrix=${json_array}" >&2
fi

# Always show the result
echo "Generated matrix: ${json_array}"
echo "Total folders: ${#folders[@]}"