#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/refreshTools.sh"

sudo cp .devcontainer/spark.conf /etc/supervisor/conf.d/

sudo chown $current_user /var/run/supervisor.sock
sudo chown $current_user /var/log/supervisor

supervisord
supervisorctl reread
supervisorctl update
