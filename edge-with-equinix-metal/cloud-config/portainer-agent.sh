#!/usr/bin/env bash
set -xueo pipefail

curl -o /tmp/metadata.json -fsSL https://metadata.platformequinix.com/metadata

jq -r ".customdata" /tmp/metadata.json > /tmp/customdata.json

EDGE_KEY=$(jq -r ".edgeKey" /tmp/customdata.json)

docker container run -d \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /var/lib/docker/volumes:/var/lib/docker/volumes \
  -v /:/host \
  -v portainer_agent_data:/data \
  -e EDGE=1 \
  -e EDGE_ID=$(hostname) \
  -e EDGE_KEY=$EDGE_KEY \
  -e EDGE_INSECURE_POLL=1 \
  -e environment=production \
  portainer/agent:2.16.2
