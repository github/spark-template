#!/bin/bash

set -e

echo "[--Build: Started--]"

# Clean up the dist directory
echo "Cleaning up the dist directory..."
rm -rf dist

# Build the frontend
echo "Compiling frontend..."
npm install -f # force because there is a known mismatch of shadcn and react 19 - https://ui.shadcn.com/docs/react-19
npm run build

echo "Copying extra files..."
cp /workspaces/proxy.js ./dist/proxy.js
cp ./app.package.json ./dist/package.json

echo "[--Build: Complete--]"
echo "Executing the deployment upload script"
echo "[--Deployment: Started--]"

# Check if GITHUB_RUNTIME_PERMANENT_NAME is empty.
# This will be set when you run with the `copilot_workbench_kv_aca` flag.
if [ -z "$GITHUB_RUNTIME_PERMANENT_NAME" ]; then
  echo "GITHUB_RUNTIME_PERMANENT_NAME is empty. Falling back to CODESPACE_NAME."

  GITHUB_RUNTIME_PERMANENT_NAME=${CODESPACE_NAME}
  size=${#GITHUB_RUNTIME_PERMANENT_NAME} 
  # if size is > 20, then truncate the name.
  # this is a limitation that's also enforced by the dotcom API
  # but I'd rather ensure that the command succeeds.
  if [ $size -gt 20 ]; then
    GITHUB_RUNTIME_PERMANENT_NAME=${GITHUB_RUNTIME_PERMANENT_NAME:0:20}
  fi
fi

echo "Deploying as ${GITHUB_USER} to ${GITHUB_RUNTIME_PERMANENT_NAME}"

gh runtime create \
  --app ${GITHUB_RUNTIME_PERMANENT_NAME} \
  --env "GITHUB_RUNTIME_PERMANENT_NAME=${GITHUB_RUNTIME_PERMANENT_NAME}" \
  --secret "GITHUB_TOKEN=${GITHUB_TOKEN}" \

gh runtime deploy \
  --app ${GITHUB_RUNTIME_PERMANENT_NAME} \
  --dir dist

DEPLOYED_URL="$(gh runtime get --app ${GITHUB_RUNTIME_PERMANENT_NAME})"

echo "[--URL-App=[https://${DEPLOYED_URL}]--]"
echo "[--Deployment: Complete--]"
