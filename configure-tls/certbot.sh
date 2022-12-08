#!/usr/bin/env sh
set -euxo pipefail

# Install Certbot
snap install core
snap refresh core

snap install --classic certbot

ln -s /snap/bin/certbot /usr/bin/certbot

certbot certonly --standalone

cat > /etc/systemd/system/certbot.timer <<EOF
[Unit]
Description=Renew LE Certificates

[Timer]
Unit=certbot.service
OnCalendar=15 3 1 * *

[Install]
WantedBy=timers.target
EOF

cat > /etc/systemd/system/certbot.service <<EOF
[Unit]
Description=Renew LE Certificates

[Service]
Type=oneshot
ExecStart=/usr/bin/certbot renew
EOF

systemctl daemon-reload
systemctl enable certbot.timer
