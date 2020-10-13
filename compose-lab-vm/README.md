# Full FIWARE Lab VM installation via docker-compose

This shows how to run a full instance of the FIWARE Marketplace including the Keyrock IDM
on a FIWARE Lab Ubuntu VM. In the following, it is assumed that the VM has the
public IP `46.17.108.87`. Change this to your IP or domain, when available.

Documentation on the marketplace and its different components can be found at the 
[Documentation page](https://business-api-ecosystem.readthedocs.io/en/latest/) and
on [Github](https://github.com/FIWARE-TMForum/Business-API-Ecosystem).

# Prerequisites

Docker and Docker compose need to be set up on the machine.

Create Docker network `web`:
```shell
docker network create -d bridge web
docker network ls
```
All containers will only run within this network and are not reacheable from other networks.





# Run

## Start IDM
First start the Keyrock IDM including its own MySQL DB instance:
```shell
cd idm
docker-compose up -d
```
Check with `docker logs fiware-keyrock` that the IDM has started.

## Configure IDM
Login to the IDM on [http://46.17.108.87:3000/](http://46.17.108.87:3000/) with the admin credentials specified in the 
idm `idm/docker-compose.yml` file (Mail: admin@test.com, PW: see docker-compose.yml file).

Create an Organization, e.g. "FIWARE-Test".

For this organization, create an Application, e.g. "FIWARE Marketplace".
Set the following parameters:
```shell
URL = http://46.17.108.87:8004
Callback URL = http://46.17.108.87:8004/auth/fiware/callback
```
and grant at least the types "Authorization Code", "Client Credentials" and "Refresh Token". Also set the
organization as provider. In the roles section, create the following roles: "seller", "customer", "admin"
and "orgAdmin".

Open the created application properties and check the OAuth2 Credentials section. Copy the Client ID
and Client Secret and paste into the Proxy OAuth2 section of the `marketplace/docker-compose.yml` file:
```shell
# ------ OAUTH2 Config ------
- BAE_LP_OAUTH2_SERVER=http://46.17.108.87:3000  # URL of the FIWARE IDM used for user authentication
- BAE_LP_OAUTH2_CLIENT_ID=<PUT CLIENT ID HERE>  # OAuth2 Client ID of the BAE applicaiton
- BAE_LP_OAUTH2_CLIENT_SECRET=<PUT CLIENT SECRET HERE>  # OAuth Client Secret of the BAE application
```

In the IDM, create a user for each role and set mail, user name and password of each user.
On the application properties page, users can then be authorized for the application given a specific role.



## Start Marketplace components
Now the marketplace components can be started. As the deployment of the Java based components (APIs and RSS) can take some time
but other components depend on that those are fully running, the Docker Compose configuration has been split and should be
started one after each other.


### Database
First start the databases:
```shell
cd db
docker-compose up -d
```
Before proceeding, both databases (MongoDB and MySQL) should be up and accepting connections. Check with:
```shell
docker logs mp-mongo
# Should show:
# 2020-10-13T12:56:48.009+0000 I NETWORK  [initandlisten] waiting for connections on port 27017

docker logs mp-mysql
# Should show:
# 2020-10-13T12:58:13.282228Z 0 [Note] mysqld: ready for connections.
# Version: '5.7.31'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server (GPL)
```


### APIs
Next start the APIs container:
```shell
cd apis
docker-compose up -d
```
Before procedding, the deployment should be finished. Check with:
```shell
docker logs mp-apis
# Should show:
# biz_apis finished successfully.
```



### RSS
Next the start the RSS container:
```shell
cd rss
docker-compose up -d
```
Before procedding, the deployment should be finished. Check with:
```shell
docker logs mp-rss
# Should show:
# Application deployed with name DSRevenueSharing.
# Command deploy executed successfully.
# RSS deployed
```


### Charging backend and proxy
Finally one can start the remaining marketplace components, the charging backend and
the proxy component:
```shell
cd marketplace
docker-compose up -d
```
Both components should be immediately up and running. The proxy log should state:
```shell
docker logs mp-proxy
# Should show
# 2020-10-13 13:13:44.301  - INFO: Server - Business Ecosystem Logic Proxy starting on port 8004
```


## Usage 
Now open the marketplace frontend provided by the proxy component on
[http://46.17.108.87:8004](http://46.17.108.87:8004) via the browser.

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
sections in the `db/docker-compose.yml` file.

