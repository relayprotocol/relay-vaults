#!/bin/bash

# Substitute the direct import with the versioned import

cd "$(dirname "$0")/.."

CONTRACT_NAME="RelayPool"

FROM_PATTERN="import ${CONTRACT_NAME} from '\\.\/abis\/.*${CONTRACT_NAME}\\.json'"
TO_PATTERN="import { ${CONTRACT_NAME} } from '\\.\/versions'"

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/${FROM_PATTERN}/${TO_PATTERN}/" src/index.ts
else
  sed -i "s/${FROM_PATTERN}/${TO_PATTERN}/" src/index.ts
fi

echo "Updated ${CONTRACT_NAME} import to use versioned import from ./versions"


