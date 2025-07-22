#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LATEST_RELEASE=$(bash "$SCRIPT_DIR/refreshTools.sh")

sudo cp .devcontainer/spark.conf /etc/supervisor/conf.d/

cd /tmp/spark
bash spark-sdk-dist/repair.sh
LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh services
cd /workspaces/spark-template

sudo chown node /var/run/
sudo chown -R node /var/log/

supervisord
supervisorctl reread
supervisorctl update