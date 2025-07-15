#!/bin/bash

set -e

echo "Checking for updates..."

WORKSPACE_DIR="/workspaces/spark-template"
LATEST_RELEASE=$(curl -s https://api.github.com/repos/github/spark-template/releases/latest)
echo "New version found. Downloading latest release."

TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

DOWNLOAD_URL=$(echo "$LATEST_RELEASE" | jq -r '.assets[0].url')
curl -L -o dist.zip -H "Accept: application/octet-stream" "$DOWNLOAD_URL"

unzip -o dist.zip
rm dist.zip
DIST_DIR="spark-sdk-dist"

bash spark-sdk-dist/repair.sh
LATEST_RELEASE="$LATEST_RELEASE" DIST_DIR="$DIST_DIR" WORKSPACE_DIR="$WORKSPACE_DIR" bash spark-sdk-dist/install-tools.sh
rm -rf $TEMP_DIR