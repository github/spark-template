#!/bin/bash

set -e

rm -rf ./spark-sdk-dist
rm -rf /workspaces/spark-tools

echo "Downloading the latest release of workbench-template from GitHub"

GITHUB_PAT="$RELEASE_PAT"
REPO="github/workbench-template"

# Fetch the latest release information
LATEST_RELEASE=$(curl -s -H "Authorization: token $GITHUB_PAT" https://api.github.com/repos/$REPO/releases/latest)

# Extract the first browser_download_url from the assets
DOWNLOAD_URL=$(echo "$LATEST_RELEASE" | jq -r '.assets[0].url')
echo "Download URL: $DOWNLOAD_URL"


# Fetch the latest release information
curl -L -o dist.zip -H "Authorization: token $GITHUB_PAT" -H "Accept: application/octet-stream" "$DOWNLOAD_URL"

unzip -o dist.zip
rm dist.zip

sudo mv ./spark-sdk-dist/server.js /usr/local/bin/spark-server
sudo mv ./spark-sdk-dist/designer.js /usr/local/bin/spark-designer
sudo mv ./spark-sdk-dist/file-syncer.js /usr/local/bin/spark-file-syncer
sudo mv ./spark-sdk-dist/spark-agent.js /usr/local/bin/spark-agent

tar -xzf ./spark-sdk-dist/spark-tools.tgz

mkdir -p /workspaces/spark-tools
sudo mv ./package/* /workspaces/spark-tools
sudo rmdir ./package
rm -rf ./spark-sdk-dist

cd /workspaces/spark-tools 
npm i 
cd /workspaces/spark-template
npm i -f /workspaces/spark-tools