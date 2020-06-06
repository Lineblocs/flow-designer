PATH=$PATH:/usr/share/node-v11.10.1-linux-x64/bin/ gulp scripts
PATH=$PATH:/usr/share/node-v11.10.1-linux-x64/bin/ gulp compress-js
yes | cp index.prod.html index.html
