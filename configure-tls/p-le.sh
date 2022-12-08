#!/usr/bin/env sh
set -euxo pipefail

docker run -d -p 9443:9443 -p 8000:8000 \
    --name portainer --restart always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v portainer_data:/data \
    -v /etc/letsencrypt/live/p.rawkode.academy:/certs/live/p.rawkode.academy:ro \
    -v /etc/letsencrypt/archive/p.rawkode.academy:/certs/archive/p.rawkode.academy:ro \
    portainer/portainer-ce:latest \
    --sslcert /certs/live/p.rawkode.academy/fullchain.pem \
    --sslkey /certs/live/p.rawkode.academy/privkey.pem
