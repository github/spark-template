#!/bin/bash

set -e

WORKSPACE_DIR="/workspaces/spark-template"
LATEST_RELEASE=$(curl -s https://api.github.com/repos/github/spark-template/releases/latest)
RELEASE_ID=$(echo "$LATEST_RELEASE" | jq -r '.id')


TEMP_DIR=/tmp/spark
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

DOWNLOAD_URL=$(echo "$LATEST_RELEASE" | jq -r '.assets[0].url')
curl -L -o dist.zip -H "Accept: application/octet-stream" "$DOWNLOAD_URL"

unzip -o dist.zip
rm dist.zip

echo $RELEASE_ID