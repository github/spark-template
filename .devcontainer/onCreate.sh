#!/bin/bash

set -e

echo "Installing the GitHub CLI"
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
        && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt update \
  && sudo apt install gh inotify-tools -y

echo "Installing the GitHub CLI Runtime extension"
# if the GITHUB_USER is monalisa, then install the plugin from the local folder
if [ "$GITHUB_USER" = "monalisa" ]; then
  cd ./gh-runtime-cli
  gh extension install .
else
  gh extension install github/gh-runtime-cli
fi

echo "Adding an alias for the GitHub CLI Runtime extension"
gh alias set runtime runtime-cli

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
sudo mv ./spark-sdk-dist/upload-to-remote.sh /usr/local/bin/upload-to-remote.sh
sudo mv ./spark-sdk-dist/file-syncer.js /usr/local/bin/spark-file-syncer
sudo mv ./spark-sdk-dist/spark-agent.js /usr/local/bin/spark-agent
sudo cp ./spark-sdk-dist/proxy.js /workspaces/proxy.js
sudo mv ./spark-sdk-dist/proxy.js  /usr/local/bin/proxy.js

tar -xzf ./spark-sdk-dist/spark-tools.tgz

mkdir -p /workspaces/spark-tools
sudo mv ./package/* /workspaces/spark-tools
sudo rmdir ./package
rm -rf ./spark-sdk-dist

cd /workspaces/spark-tools 
npm i 
cd /workspaces/spark-template
npm i -f /workspaces/spark-tools