#!/bin/sh

if [ -z "${IMAGE_TAG:-}" ]; then
  echo "{\"service\":\"${SERVICE_NAME:-vaults-backend}\",\"level\":\"fatal\",\"msg\":\"IMAGE_TAG is not set; ponder start requires it as the database schema name\"}"
  exit 1
fi

LOG_LEVEL="${VAULTS_INDEXER_LOG_LEVEL:-warn}"

echo "{\"service\":\"${SERVICE_NAME:-vaults-backend}\",\"level\":\"info\",\"msg\":\"starting ponder (schema=${IMAGE_TAG}, log-level=${LOG_LEVEL}, views-schema=vaults-view)\"}"

set -o pipefail

ponder start \
  --log-format json \
  --log-level "$LOG_LEVEL" \
  --views-schema=vaults-view \
  --schema "$IMAGE_TAG" \
  | sh "$(dirname "$0")/log-format.sh"
