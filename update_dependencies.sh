#! /bin/sh

# install dep. for python ./scripts
#pip install -r requirements.txt


# A useful script to download the latest version of bootstrap and jquery

rm -rf node_modules package-lock.json
npm i bootstrap@4 jquery@3 jquery-ui
npm i bootstrap-toggle
npm i @fortawesome/fontawesome-free
npm i mustache handlebars
npm i clipboard
npm i list.js
npm i js-beautify json-parse-better-errors
npm i js-yaml
npm i brace
npm i localforage memory-cache

npm i --save-dev typescript
npm i --save-dev browserify tsify
npm i --save-dev unassertify envify uglifyify common-shakeify browser-pack-flat uglify-es
npm i --save-dev @tsconfig/recommended
npm i --save-dev @types/node
npm i --save-dev @types/jquery
npm i --save-dev @types/jqueryui
npm i --save-dev @types/bootstrap
npm i --save-dev @types/bootstrap-toggle
npm i --save-dev @types/mustache
npm i --save-dev @types/handlebars
npm i --save-dev @types/list.js
npm i --save-dev @types/json-parse-better-errors
npm i --save-dev @types/js-beautify
npm i --save-dev @types/js-yaml
npm i --save-dev @types/ace
npm i --save-dev @types/clipboard
npm i --save-dev @types/localforage
npm i --save-dev @types/memory-cache


cp node_modules/jquery/dist/jquery.min.* assets/js

mkdir assets/js/bootstrap
mkdir assets/css/bootstrap
cp -r node_modules/bootstrap/scss/* _sass/bootstrap
cp node_modules/bootstrap/dist/js/bootstrap.bundle.min.* assets/js/bootstrap

cp node_modules/bootstrap-toggle/js/*.min.js assets/js/bootstrap
cp node_modules/bootstrap-toggle/css/*.min.css assets/css/bootstrap

mkdir assets/js/font-awesome
mkdir assets/css/font-awesome
mkdir assets/css/webfonts
cp node_modules/@fortawesome/fontawesome-free/js/*.min.js assets/js/font-awesome
cp node_modules/@fortawesome/fontawesome-free/css/*.min.css assets/css/font-awesome
cp node_modules/@fortawesome/fontawesome-free/webfonts/*.* assets/css/webfonts
