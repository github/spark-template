#!/bin/bash

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