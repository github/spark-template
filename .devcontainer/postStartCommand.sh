#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LATEST_RELEASE=$(bash "$SCRIPT_DIR/refreshTools.sh")

# Check git repository state and create initial commit if needed
cd /workspaces/spark-template
echo "Checking git repository state"
if ! git rev-parse HEAD >/dev/null 2>&1; then
    echo "No commits found, creating initial commit"
    git add . || true
    git commit --allow-empty --no-verify -m "Initial commit" --no-gpg-sign || true
fi 

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

# Check if SNAPSHOT_SAS_URL was passed, if so run hydrate.sh
if [ -n "$SNAPSHOT_SAS_URL" ]; then
    WORKSPACE_DIR="/workspaces/spark-template"
    SAS_URI="$SNAPSHOT_SAS_URL" /usr/local/bin/hydrate.sh $WORKSPACE_DIR
fi

cd /tmp/spark
LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh sdk
cd /workspaces/spark-template

# Keep reflog commits "forever"
git config gc.reflogExpire 500.years.ago
git config gc.reflogExpireUnreachable 500.years.ago


# Set up post-commit hook and also run the build script to perform a one-time build for static preview
ln -fs /usr/local/bin/post-commit .git/hooks/post-commit
/usr/local/bin/static-preview-build.sh

cd /tmp/spark
LATEST_RELEASE="$LATEST_RELEASE" WORKSPACE_DIR="$WORKSPACE_DIR" bash /tmp/spark/spark-sdk-dist/install-tools.sh cli
cd /workspaces/spark-template
