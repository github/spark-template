#!/bin/bash

set -e

echo "Checking for updates to workbench-template from GitHub"

MARKER_DIR="/var/lib/spark/.versions"
RELEASE_MARKER_FILE="$MARKER_DIR/release"
TOOLS_MARKER_FILE="$MARKER_DIR/tools"

sudo mkdir -p "$MARKER_DIR"

# Fetch the latest release information
LATEST_RELEASE=$(curl -s -H "Authorization: token $TEMPLATE_PAT" https://api.github.com/repos/github/spark-template/releases/latest)

# Extract the release ID to use as marker
RELEASE_ID=$(echo "$LATEST_RELEASE" | jq -r '.id')

# Check if marker file exists and has the same release ID
if [ -f "$RELEASE_MARKER_FILE" ] && [ "$(cat "$RELEASE_MARKER_FILE")" == "$RELEASE_ID" ]; then
    echo "Already at the latest release. Skipping download."
    exit 0
fi

echo "New version found. Downloading latest release."

DOWNLOAD_URL=$(echo "$LATEST_RELEASE" | jq -r '.assets[0].url')
curl -L -o dist.zip -H "Authorization: token $GITHUB_PAT" -H "Accept: application/octet-stream" "$DOWNLOAD_URL"

unzip -o dist.zip
rm dist.zip

sudo mv ./spark-sdk-dist/server.js /usr/local/bin/spark-server
sudo mv ./spark-sdk-dist/designer.js /usr/local/bin/spark-designer
sudo mv ./spark-sdk-dist/upload-to-remote.sh /usr/local/bin/upload-to-remote.sh
sudo mv ./spark-sdk-dist/file-syncer.js /usr/local/bin/spark-file-syncer
sudo mv ./spark-sdk-dist/spark-agent.js /usr/local/bin/spark-agent
sudo cp ./spark-sdk-dist/proxy.js /workspaces/proxy.js
sudo mv ./spark-sdk-dist/proxy.js  /usr/local/bin/proxy.js

if [ -f "$TOOLS_MARKER_FILE" ] && [ "$(cat "$TOOLS_MARKER_FILE")" == "$(cat ./spark-sdk-dist/spark-tools-version)" ]; then
    echo "Already at the latest tools version. Skipping extraction."
else
    tar -xzf ./spark-sdk-dist/spark-tools.tgz

    rm -rf /workspaces/spark-tools
    mkdir -p /workspaces/spark-tools
    sudo mv ./package/* /workspaces/spark-tools
    sudo rmdir ./package

    cd /workspaces/spark-tools 
    npm i 
    cd /workspaces/spark-template
    npm i -f /workspaces/spark-tools

    sudo cp ./spark-sdk-dist/spark-tools-version "$TOOLS_MARKER_FILE"
fi

sudo mv spark-sdk-dist/gh-spark-cli /usr/local/bin/
cd /usr/local/bin/gh-spark-cli
gh extension install .
gh alias set spark spark-cli --clobber

rm -rf ./spark-sdk-dist

# Update marker file with latest release ID
echo "$RELEASE_ID" | sudo tee "$RELEASE_MARKER_FILE" > /dev/null

echo "Tools installed successfully."