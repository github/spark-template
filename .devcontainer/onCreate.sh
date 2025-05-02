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

echo "Installing azcopy"

sudo wget -O /usr/local/bin/azcopytar https://aka.ms/downloadazcopy-v10-linux
sudo tar -xvf /usr/local/bin/azcopytar -C /usr/local/bin/
sudo rm /usr/local/bin/azcopytar
azcopy_dir=$(find /usr/local/bin/ -type d -name "azcopy*" | head -n 1)
sudo mv "$azcopy_dir/azcopy" /usr/local/bin/azcopy
sudo rm -rf "$azcopy_dir"
