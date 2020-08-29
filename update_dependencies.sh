#! /bin/sh

# A useful script to download the latest version of bootstrap and jquery

rm -rf node_modules package-lock.json
npm i bootstrap@4 jquery@3 jquery-ui
npm i bootstrap-toggle
npm i @fortawesome/fontawesome-free
npm i mustache handlebars
npm i clipboard
npm i list.js
npm i js-beautify json-parse-better-errors htmlhint
npm i esprima js-yaml
npm i brace

npm i --save-dev typescript
npm i --save-dev browserify tsify
npm i --save-dev @tsconfig/recommended
npm i --save-dev @types/node
npm i --save-dev @types/jquery
npm i --save-dev @types/bootstrap
npm i --save-dev @types/bootstrap-toggle
npm i --save-dev @types/mustache
npm i --save-dev @types/list.js
npm i --save-dev @types/htmlhint
npm i --save-dev @types/json-parse-better-errors
npm i --save-dev @types/js-beautify
npm i --save-dev @types/js-yaml
npm i --save-dev @types/brace
npm i --save-dev @types/clipboard
npm i --save-dev @types/jqueryui





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

mkdir assets/js/handlebars
cp node_modules/handlebars/dist/*.min.* assets/js/handlebars
mkdir assets/js/mustache
cp node_modules/mustache/mustache.min.* assets/js/mustache

mkdir assets/js/beautify
cp node_modules/js-beautify/js/lib/beautify*.js assets/js/beautify

mkdir assets/js/yaml
cp node_modules/js-yaml/dist/*.min.js assets/js/yaml

mkdir assets/js/esprima
cp node_modules/esprima/dist/*.js assets/js/esprima

mkdir assets/js/clipboard
cp node_modules/clipboard/dist/*.min.js assets/js/clipboard

mkdir assets/js/htmlhint
cp node_modules/htmlhint/dist/*.min.js assets/js/htmlhint

mkdir assets/js/csslint
cp node_modules/csslint/dist/*.js assets/js/csslint

mkdir assets/js/jsonlint
cp node_modules/jsonlint/web/*.js assets/js/jsonlint

mkdir assets/js/ace
mkdir assets/js/ace/snippets
cp node_modules/ace-builds/src-min-noconflict/*.js assets/js/ace
cp node_modules/ace-builds/src-min-noconflict/snippets/*.js assets/js/ace/snippets

mkdir assets/js/listjs
cp node_modules/list.js/dist/*.min.js assets/js/listjs