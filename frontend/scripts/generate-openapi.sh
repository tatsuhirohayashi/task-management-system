#!/bin/bash

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)
FRONTEND_DIR=$(cd -- "${SCRIPT_DIR}/.." && pwd)
REPO_ROOT=$(cd -- "${FRONTEND_DIR}/.." && pwd)

OPENAPI_SPEC="${REPO_ROOT}/api-schema/generated/openapi.yaml"
TARGET_DIR="${FRONTEND_DIR}/src/external/client/api/generated"

if [ ! -f "${OPENAPI_SPEC}" ]; then
  echo "❌ OpenAPI spec not found at ${OPENAPI_SPEC}"
  echo "   Run the TypeSpec/OpenAPI generation pipeline first (e.g. pnpm run generate:openapi in api-schema)."
  exit 1
fi

cd "${FRONTEND_DIR}"

echo "🌀 Generating TypeScript API client from ${OPENAPI_SPEC}"
rm -rf "${TARGET_DIR}"

npx openapi-typescript-codegen \
  --input "${OPENAPI_SPEC}" \
  --output "${TARGET_DIR}" \
  --client fetch \
  --useOptions

echo "✅ TypeScript client generated in ${TARGET_DIR}"