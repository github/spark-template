#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/refreshTools.sh"

# Check if SNAPSHOT_SAS_URL was passed, if so run hydrate.sh in background
if [ -n "$SNAPSHOT_SAS_URL" ]; then
    WORKSPACE_DIR="/workspaces/spark-template"
    SAS_URI="$SNAPSHOT_SAS_URL" /usr/local/bin/hydrate.sh $WORKSPACE_DIR > $WORKSPACE_DIR/hydration.log 2>&1 &
fi

sudo cp .devcontainer/spark.conf /etc/supervisor/conf.d/

sudo chown node /var/run/
sudo chown -R node /var/log/

supervisord
supervisorctl reread
supervisorctl update

npm i 
