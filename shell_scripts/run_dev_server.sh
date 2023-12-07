#! /bin/bash
yes | cp index.prod.html index.html

INDEX_PATH='index.html'
sed "s/CONFIGURED_DEPLOYMENT_DOMAIN/${DEPLOYMENT_DOMAIN}/g" $INDEX_PATH > $INDEX_PATH.cop
mv $INDEX_PATH.cop $INDEX_PATH

bower install --allow-root
gulp scripts
gulp compress-js
gulp compress-css

#yes | cp index.prod.html index.html

#gulp serve
gulp watch
