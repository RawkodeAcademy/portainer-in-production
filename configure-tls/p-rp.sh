#!/usr/bin/env sh
set -euxo pipefail

docker container rm -f $(docker container ls -a -q)

#docker volume create portainer
docker run -d -p 9443:9443 -p 8000:8000 \
    --name portainer --restart always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v portainer_data:/data \
    portainer/portainer-ce:latest


#docker volume create caddy-data caddy-config
docker run -d -p 443:443 -p 80:80 --link portainer:portainer -v $(pwd)/Caddyfile:/etc/caddy/Caddyfile -v caddy-data:/data -v caddy-config:/config caddy:2-alpine
