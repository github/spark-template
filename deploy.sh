#!/bin/bash

set -e

echo "[--Build: Started--]"

# Check Revision name if exists
REVISION_NAME=${1:-""} # Use the first argument or default to empty string
echo "Revision name: $REVISION_NAME"

# Set the output directory based on the revision name if provided
if [ "$REVISION_NAME" != "" ]; then
  OUTPUT_DIR="${REVISION_NAME}-dist"
else
  OUTPUT_DIR="dist"
fi
echo "Output directory: $OUTPUT_DIR"

# Clean up the output directory
echo "Cleaning up the output directory..."
rm -rf "$OUTPUT_DIR"

# Build the frontend
echo "Compiling frontend..."
npm install -f # force because there is a known mismatch of shadcn and react 19 - https://ui.shadcn.com/docs/react-19
OUTPUT_DIR="$OUTPUT_DIR" npm run build

echo "Copying extra files..."
cp /workspaces/proxy.js "$OUTPUT_DIR/proxy.js"
cp ./app.package.json "$OUTPUT_DIR/package.json"

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

if [ "$REVISION_NAME" != "" ]; then
  revision_flag="--revision-name $REVISION_NAME"
else
  revision_flag=""
fi

gh runtime create \
  --app ${GITHUB_RUNTIME_PERMANENT_NAME} \
  --env "GITHUB_RUNTIME_PERMANENT_NAME=${GITHUB_RUNTIME_PERMANENT_NAME}" \
  --secret "GITHUB_TOKEN=${GITHUB_TOKEN}" \
  ${revision_flag} 

gh runtime deploy \
  --app ${GITHUB_RUNTIME_PERMANENT_NAME} \
  --dir "$OUTPUT_DIR" \
  ${revision_flag} 

# TODO: Update CLI to get revision app 
DEPLOYED_URL="$(gh runtime get --app ${GITHUB_RUNTIME_PERMANENT_NAME})"

echo "[--URL-App=[https://${DEPLOYED_URL}]--]"
echo "[--Deployment: Complete--]"
