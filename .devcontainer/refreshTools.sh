#!/bin/bash

set -e

echo "Checking for updates to workbench-template from GitHub"

WORKSPACE_DIR="/workspaces/spark-template"

MARKER_DIR="/var/lib/spark/.versions"
RELEASE_MARKER_FILE="$MARKER_DIR/release"
TOOLS_MARKER_FILE="$MARKER_DIR/tools"

sudo mkdir -p "$MARKER_DIR"

# Fetch the latest release information
LATEST_RELEASE=$(curl -s -H "Authorization: token $TEMPLATE_PAT" https://api.github.com/repos/github/spark-template/releases/latest)

# Check if marker file exists and has the same release ID
RELEASE_ID=$(echo "$LATEST_RELEASE" | jq -r '.id')
if [ -f "$RELEASE_MARKER_FILE" ] && [ "$(cat "$RELEASE_MARKER_FILE")" == "$RELEASE_ID" ]; then
    echo "Already at the latest release. Skipping download."
    exit 0
fi

echo "New version found. Downloading latest release."

TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

DOWNLOAD_URL=$(echo "$LATEST_RELEASE" | jq -r '.assets[0].url')
curl -L -o dist.zip -H "Authorization: token $TEMPLATE_PAT" -H "Accept: application/octet-stream" "$DOWNLOAD_URL"

unzip -o dist.zip
rm dist.zip

# Upgrade the Spark Runtime tools
sudo mv ./spark-sdk-dist/server.js /usr/local/bin/spark-server
sudo mv ./spark-sdk-dist/designer.js /usr/local/bin/spark-designer
sudo mv ./spark-sdk-dist/upload-to-remote.sh /usr/local/bin/upload-to-remote.sh
sudo mv ./spark-sdk-dist/deploy.sh /usr/local/bin/deploy.sh
sudo mv ./spark-sdk-dist/shutdown.sh /usr/local/bin/shutdown.sh
sudo mv ./spark-sdk-dist/hydrate.sh /usr/local/bin/hydrate.sh
sudo mv ./spark-sdk-dist/file-syncer.js /usr/local/bin/spark-file-syncer
sudo mv ./spark-sdk-dist/spark-agent.js /usr/local/bin/spark-agent
sudo cp ./spark-sdk-dist/proxy.js /workspaces/proxy.js
sudo mv ./spark-sdk-dist/proxy.js  /usr/local/bin/proxy.js
sudo mv ./spark-sdk-dist/post-commit ${WORKSPACE_DIR}/.git/hooks/post-commit

# Upgrade the Spark Tools package
if [ -f "$TOOLS_MARKER_FILE" ] && [ "$(cat "$TOOLS_MARKER_FILE")" == "$(cat ./spark-sdk-dist/spark-tools-version)" ]; then
    echo "Already at the latest tools version. Skipping extraction."
else
    tar -xzf ./spark-sdk-dist/spark-tools.tgz

    sudo rm -rf $WORKSPACE_DIR/packages/spark-tools
    mkdir -p $WORKSPACE_DIR/packages/spark-tools
    sudo mv ./package/* $WORKSPACE_DIR/packages/spark-tools
    sudo rmdir ./package

    cd $WORKSPACE_DIR
    npm i -f
    cd - >/dev/null

    sudo cp ./spark-sdk-dist/spark-tools-version "$TOOLS_MARKER_FILE"
fi

# Upgrade the GH CLI extension
sudo rm -rf /usr/local/bin/gh-spark-cli
sudo mv spark-sdk-dist/gh-spark-cli /usr/local/bin/
cd /usr/local/bin/gh-spark-cli
# The --force option on gh extension install isn't honored for local, so manually remove it first.
# It's not an issue if that fails though as that probably just means it was the first time running this.
gh extension remove spark-cli >/dev/null || true
gh extension install .
gh alias set spark spark-cli --clobber
cd - >/dev/null

rm -rf $TEMP_DIR

# Update marker file with latest release ID
echo "$RELEASE_ID" | sudo tee "$RELEASE_MARKER_FILE" > /dev/null

echo "Tools installed successfully."
