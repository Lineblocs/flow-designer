FROM --platform=linux/amd64 node:11.10.1-alpine AS builder
WORKDIR /app/
RUN npm config set unsafe-perm=true
RUN npm install
RUN npm install -g install gulp@3.9.1
RUN npm install -g install node-sass@4.13.0 --unsafe-perm
RUN npm install -g install bower@1.8.8

COPY ../ .

ENTRYPOINT ["./shell_scripts/entrypoint.sh"]