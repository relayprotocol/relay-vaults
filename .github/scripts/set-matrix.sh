#!/bin/bash

# Build JSON array with proper quotes
matrix='['

# Add base folders
first=true
for folder in smart-contracts backend claimer; do
  if [ "$first" = true ]; then
    matrix="${matrix}\"${folder}\""
    first=false
  else
    matrix="${matrix},\"${folder}\""
  fi
done

# Add packages if they exist
if [ -d "packages" ]; then
  for dir in packages/*/; do
    if [ -d "$dir" ] && [ -f "${dir}package.json" ]; then
      dirname="${dir%/}"  # Remove trailing slash
      matrix="${matrix},\"${dirname}\""
    fi
  done
fi

matrix="${matrix}]"

# Write to GitHub output
echo "matrix=${matrix}" >> "$GITHUB_OUTPUT"

# Debug output
echo "Generated matrix: ${matrix}"