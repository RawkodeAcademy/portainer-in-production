#!/usr/bin/env bash
set -xueo pipefail

export DEBIAN_FRONTEND=noninteractive

apt update
apt upgrade --yes
apt install --yes \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg-agent \
  jq \
  software-properties-common
