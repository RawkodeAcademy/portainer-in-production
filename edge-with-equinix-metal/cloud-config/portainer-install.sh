#!/usr/bin/env bash
set -xueo pipefail

cat <<EOF > /etc/systemd/system/portainer.service
[Unit]
Description=Portainer
Wants=network-online.target
After=network-online.target docker.service
Requires=docker.service

[Service]
TimeoutStartSec=0
Restart=always
ExecStartPre=-/usr/bin/docker stop -t 5 portainer
ExecStartPre=-/usr/bin/docker rm portainer
ExecStartPre=-/usr/bin/docker volume create portainer_data
ExecStartPre=-/usr/bin/docker pull portainer/portainer-ee:latest
ExecStart=/usr/bin/docker run -p 8000:8000 -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data --name portainer portainer/portainer-ee
ExecStop=/usr/bin/docker stop -t 5 portainer
ExecStopPost=-/usr/bin/docker rm portainer

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable portainer
systemctl start portainer
