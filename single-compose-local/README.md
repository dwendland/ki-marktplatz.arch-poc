# Full local installation via docker-compose

This shows how to run a full local instance of the FIWARE Marketplace including the Keyrock IDM.


# Prerequisites

Create Docker network `marketplace`:
```shell
docker network create marketplace
docker network ls
```
All containers will only run within this network and are not reacheable from other networks.



# Run

## Start IDM

## Configure IDM
Login to IDM (http://localhost:3000/idm/applications/85e62a00-318a-4763-8cff-1ae305e84b8b)
Create Organization "FIWARE-Test"
Create Application "FIWARE Marketplace" with URL and role settings TODO
Enter client-id and client-secret in marketplace/docker-compose.yml mp-proxy service

TODO: Struggle with Docker networks to make OAuth2 work (proxy.docker and idm.docker aliases not reacheable from host's chrome!)

Create and assign user test-seller with seller role
Create and assign user test-customer with customer role


## Start Marketplace

Login (http://localhost:8004/)



