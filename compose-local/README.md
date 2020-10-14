# Full local installation via docker-compose

This shows how to run a full local instance of the FIWARE Marketplace including the Keyrock IDM.



# Prerequisites

Docker and Docker compose neet to be set up on the machine.

Create Docker network `marketplace`:
```shell
docker network create marketplace
docker network ls
```
All containers will only run within this network and are not reacheable from other networks.

Each container is reacheable by an alias for the hostname, e.g. 'idm.docker' or 'proxy.docker',
but only within the 'marketplace' network. In order to make the OAuth2 process to work with the
browser on the host machine, add the following lines to your /etc/hosts file which maps the
container hostnames to the localhost.
```shell
# KI-Marktplatz
127.0.0.1 idm.docker
127.0.0.1 proxy.docker
```




# Run

## Start IDM
First start the Keyrock IDM including its own MySQL DB instance:
```shell
cd idm
docker-compose up -d
```
Check with `docker logs fiware-keyrock` that the IDM has started.

## Configure IDM
Login to the IDM on [http://idm.docker:3000/](http://idm.docker:3000/) with the admin credentials specified in the 
idm `idm/docker-compose.yml` file (Mail: admin@test.com, PW: admin_pw).

Create an Organization, e.g. "FIWARE-Test".

For this organization, create an Application, e.g. "FIWARE Marketplace".
Set the following parameters:
```shell
URL = http://proxy.docker:8004
Callback URL = http://proxy.docker:8004/auth/fiware/callback
```
and grant at least the types "Authorization Code", "Client Credentials" and "Refresh Token". Also set the
organization as provider. In the roles section, create the following roles: "seller", "customer", "admin"
and "orgAdmin".

Open the created application properties and check the OAuth2 Credentials section. Copy the Client ID
and Client Secret and paste into the Proxy OAuth2 section of the `marketplace/docker-compose.yml` file:
```shell
# ------ OAUTH2 Config ------
- BAE_LP_OAUTH2_SERVER=http://idm.docker:3000  # URL of the FIWARE IDM used for user authentication
- BAE_LP_OAUTH2_CLIENT_ID=<PUT CLIENT ID HERE>  # OAuth2 Client ID of the BAE applicaiton
- BAE_LP_OAUTH2_CLIENT_SECRET=<PUT CLIENT SECRET HERE>  # OAuth Client Secret of the BAE application
```

In the IDM, create a user for each role and set mail, user name and password of each user.
On the application properties page, users can then be authorized for the application given a specific role.



## Start Marketplace
Now the marketplace components can be started:
```shell
cd marketplace
docker-compose up -d
```
This will take some time, especially for the Java based components RSS and APIs. The marketplace is up
and running when the proxy has completed it's sanity checks and can access the RSS and API containers.
You can check this with `docker logs mp-proxy`.

Now open the marketplace frontend provided by the proxy component on
[http://proxy.docker:8004](http://proxy.docker:8004) via the browser.

You can sign in as one of the created users. Remember to log out of the IDM first. During the log in
process, you should be forwarded to the IDM where you log in e.g. as a user with a seller role. There
you grant access to the application and then get redirected to the marketplace frontend. An access token
should has been exchanged in that moment and you should be able to use the markeplace functionalities
allowed for that role.


## Remarks

Per default, the IDM component is configured for data persistance. This means, that created user, applications, etc.
will remain when restarting the IDM and IDM DB containers. If data persistance for the IDM should be disabled,
comment out the mounting of the DB volume in the `idm/docker-compose.yml` MySQL section.

For the marketplace itself, data persistance is disabled by default. Any changes made within the marketplace, e.g. creating products,
will be lost after restarting the marketplace components. If data persistance should be enabled, uncomment the DB volume
sections in the `marketplace/docker-compose.yml` file.

