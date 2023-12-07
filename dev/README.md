# Use Docker Compose to develop lineblocs

## Notice
Please make sure use docker compose with minimal version 2.2

## Structure of directory
```shell
.
├── apache.conf
├── app
├── app.min.css
├── bitbucket-pipelines.yml
├── custom
├── custom.js
├── dev
|	├── docker-compose.full.yml
│	├── docker-compose.yml
│	├── .env
│	├── .env.example
│	├── mysql
│	│   └── dbinitial
│	│       ├── init.sql
│	│       ├── lineblocs.sql
│	│       └── opensips.sql
│	└── README.md
├── dialogs
├── dist
├── Dockerfile
├── editor.html
├── fonts
├── gulpfile.js
├── img
├── index.dev.html
├── index.html
├── index.prod.html
├── joint-1.0.2.css
├── main.min.js
├── md-custom.css
├── merge_templates.js
├── models
├── node_modules
├── package.json
├── package-lock.json
├── ports.conf
├── README.md
├── shell_scripts
├── src
├── styles.css
├── styles.dark.css
├── templates
├── templates.html
└── vs
```

## Simple running
```shell
$ git clone https://github.com/Lineblocs/flow-designer.git
$ cd flow-designer/dev
$ cp .env.example .env
$ docker compose --profile enable_proxy up -d
$ docker compose --profile enable_proxy watch
```
 Open web browser 
`http://127.0.0.1:8787`   -> `editor lineblocs`

## Advance running

### Clone user-app project 
Clone docker compose and move to directory.
```shell
$ git clone https://github.com/Lineblocs/flow-designer.git
$ cd flow-designer/dev
```

### Make .env file and confige
```shell
$ cp .env.example .env
```
`DEPLOYMENT_DOMAIN` -> base domain 
`EDITOR_PORT_HOST` -> Port to publish editor application on host interface

`CONFIG_DB_HOST` -> is host of database. While using mysql on container. Set this value to name of container service.
`DB_USERNAME` -> username of database
`CONFIG_DB_PASSWORD` -> password of database user.
`CONFIG_DB_ROOT_PASSWORD` -> password of root user
`CONFIG_DB_DATABASE` -> database name
`CONFIG_DB_PORT` -> database port on mysql container
`CONFIG_DB_OPENSIPS_DATABASE` -> opensips database name
`MYSQL_PORT_HOST` -> Port of host mapping to mysql container on 3306

`VERSION` -> version image of lineblocs site and editor

While want to access website with `DEPLOYMENT_DOMAIN`, after set `DEPLOYMENT_DOMAIN`. Don't forget tp change hosts file local machine. On linux file exists at /etc/hosts. On windows file exist at c:\Windows\System32\Drivers\etc\hosts. Add `127.0.0.1` -> `DEPLOYMENT_DOMAIN`  ;  `127.0.0.1` -> `app.DEPLOYMENT_DOMAIN`


###  create container
Create and run container with this command below. 
`--profile enable_proxy` use for create nginx as proxy. Remove `--profile enable_proxy` while won't create nginx as proxy. While use nginx as proxy, must confige local hosts with DEPLOYMENT_DOMAIN. 

```shell
$ docker compose --profile enable_proxy up -d
```
```shell
$ docker compose --profile enable_proxy watch
```

### Access lineblocs
Lineblocs-flow-designer -> http://127.0.0.1:{EDITOR_PORT_HOST}  without `--profile enable_proxy`

Lineblocs-flow-designer -> http://editor.{DEPLOYMENT_DOMAIN}  with `--profile enable_proxy`

Please remember use http, because on docker compose config disable https.

### Useful command
Check node log  `docker logs -f lineblocs-editor`

Log in to terminal of container  -> `docker exec -it lineblocs-editor bash`

Modify lineblocs-editor project under `app` or check config on gulpfile.js

Use `docker logs -f lineblocs-editor` to track file modification. If file content changed (*.js, *.html or *.css) but nothing happen on web browser, Please run `docker compose restart`
### Note
Please remember, lineblocs editor integrated with lineblocs app and libeblocs site. So make sure can access https://lineblocs.com and https://app.lineblocs.com
