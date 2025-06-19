#!/bin/bash

set -euo pipefail

# Initialize array with base folders
folders=('smart-contracts' 'backend' 'claimer')

# Function to add to GITHUB_OUTPUT if it exists
output_to_github() {
  local key="$1"
  local value="$2"
  
  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "${key}=${value}" >> "$GITHUB_OUTPUT"
  else
    echo "[LOCAL] Would set ${key}=${value}" >&2
  fi
}

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
output_to_github "matrix" "$json_array"

echo -e "\nGenerated matrix: $json_array"
echo "Total folders: ${#folders[@]}"