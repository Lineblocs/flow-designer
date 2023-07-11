FROM --platform=linux/amd64 node:11.10.1 AS builder
WORKDIR /app/
COPY . .
RUN npm config set unsafe-perm=true
RUN npm install
RUN npm install -g install gulp@3.9.1
RUN npm install -g install node-sass@4.13.0 --unsafe-perm
RUN npm install -g install bower@1.8.8
RUN ./shell_scripts/build_docker.sh

FROM --platform=linux/amd64 httpd:2.4
WORKDIR /usr/local/apache2/htdocs/
RUN apt-get -y update
COPY --from=builder /app/ .

COPY ports.conf /etc/apache2/ports.conf
COPY apache.conf /usr/local/apache2/conf/httpd.conf
EXPOSE 3000
ENTRYPOINT ["./shell_scripts/entrypoint.sh"]