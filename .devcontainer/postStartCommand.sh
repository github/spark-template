#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/refreshTools.sh"

sudo cp .devcontainer/spark.conf /etc/supervisor/conf.d/

sudo chown node /var/run/
sudo chown node /var/log/ -R

supervisord
supervisorctl reread
supervisorctl update
