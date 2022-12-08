# GitOps

Portainer has a concept called Stacks. Stacks are a collection of services that are deployed together. Stacks can be deployed from a Docker Compose YAML or a set of Kubernetes manifest files.

We've all seen GitOps on Kubernetes before and this involves taking on the all-mighty complexity of Kubernetes. Sometimes ... you just need things to be easier.

Enter Portainer.

In this tutorial, we'll deploy [EdgeDB](https://edgedb.com/) via Portainer Stacks with continuous delivery via a Stack configured to point to a Git repository.

## Prerequisites

- Docker
- Portainer

## Deploying Portainer

### Create a Docker volume

```shell
docker volume create portainer_data
```

###  Start Portainer

```shell
 docker run -d -p 8000:8000 -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest
```

## Deploying EdgeDB

In this tutorial, we'll deploy EdgeDB via Portainer Stacks.

### Create a new Stack

Select Stacks from the left hand menu and click on the "Add Stack" button.

### Select "Repository"

Repository URL is your fork of `https://github.com/RawkodeAcademy/portainer-in-production`. You can use this repository, but then you won't be able to modify the schema and see the database update.

### Click "Deploy the Stack"

Done!
