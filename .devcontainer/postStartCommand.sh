#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/refreshTools.sh"

sudo cp .devcontainer/spark.conf /etc/supervisor/conf.d/

sudo service supervisor start
sudo supervisorctl reread
sudo supervisorctl update

