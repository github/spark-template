#!/bin/bash

set -e

echo "[--Build: Started--]"

# Check Deploy Type
revision_name=${1:-""} # Use the first argument or default to empty string
echo "Revision name: $revision_name"

# Set the output directory based on the deploy type
if [ "$revision_name" == "preview" ]; then
  output_dir="preview-dist"
else
  output_dir="dist"
fi
echo "Output directory: $output_dir"

# Clean up the output directory
echo "Cleaning up the output directory..."
rm -rf "$output_dir"

# Build the frontend
echo "Compiling frontend..."
npm install -f # force because there is a known mismatch of shadcn and react 19 - https://ui.shadcn.com/docs/react-19
OUTPUT_DIR="$output_dir" npm run build

echo "Copying extra files..."
cp /workspaces/proxy.js "$output_dir/proxy.js"
cp ./app.package.json "$output_dir/package.json"

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

if [ "$revision_name" != "" ]; then
  revision_flag="--revision-name $revision_name"
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
  --dir "$output_dir" \
  ${revision_flag} 

# TODO: Update CLI to get revision app 
DEPLOYED_URL="$(gh runtime get --app ${GITHUB_RUNTIME_PERMANENT_NAME})"

echo "[--URL-App=[https://${DEPLOYED_URL}]--]"
echo "[--Deployment: Complete--]"
