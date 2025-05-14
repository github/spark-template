#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/refreshTools.sh"

USE_DESIGNER=true USE_SPARK_AGENT=true npm run dev &
proxy.js &
spark-server &
spark-agent &
spark-designer &
spark-file-syncer 13000 >> /tmp/.spark-file-syncer.log 2>&1 &

echo "Spark tools started successfully"

wait
