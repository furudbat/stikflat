#! /bin/sh

# A useful script to download the latest version of bootstrap and jquery

rm -rf node_modules package-lock.json
npm i bootstrap@4 jquery@3 jquery-ui
npm i bootstrap-toggle
npm i @fortawesome/fontawesome-free
npm i tinymce froala-editor codemirror 
npm i mustache
npm i js-beautify
npm i linkifyjs
npm i esprima js-yaml
npm i clipboard

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

mkdir assets/js/froala-editor
mkdir assets/js/froala-editor/plugins
mkdir assets/js/froala-editor/third_party
cp node_modules/froala-editor/js/froala_editor.pkgd.min.* assets/js/froala-editor
cp node_modules/froala-editor/js/plugins/*.min.js assets/js/froala-editor/plugins
cp node_modules/froala-editor/js/third_party/*.min.js assets/js/froala-editor/third_party
cp node_modules/froala-editor/css/froala_editor.pkgd.min.* assets/css/froala-editor

mkdir assets/css/froala-editor
mkdir assets/css/froala-editor/plugins
mkdir assets/css/froala-editor/themes
mkdir assets/css/froala-editor/third_party
cp node_modules/froala-editor/css/plugins/*.min.css assets/css/froala-editor/plugins
cp node_modules/froala-editor/css/themes/*.min.css assets/css/froala-editor/themes
cp node_modules/froala-editor/css/third_party/*.min.css assets/css/froala-editor/third_party


mkdir assets/js/codemirror
mkdir assets/js/codemirror/keymap
mkdir assets/css/codemirror
mkdir assets/css/codemirror/theme
cp node_modules/codemirror/lib/*.js assets/js/codemirror
cp node_modules/codemirror/keymap/*.js assets/js/codemirror/keymap
cp -r node_modules/codemirror/mode/ assets/js/codemirror
cp -r node_modules/codemirror/addon/ assets/js/codemirror
cp node_modules/codemirror/lib/*.css assets/css/codemirror
cp node_modules/codemirror/theme/*.css assets/css/codemirror/theme


mkdir assets/js/tinymce
cp node_modules/tinymce/*.min.js assets/js/tinymce
cp -r node_modules/tinymce/themes/ assets/js/tinymce
cp -r node_modules/tinymce/icons/ assets/js/tinymce
cp -r node_modules/tinymce/skins/ assets/js/tinymce
cp -r node_modules/tinymce/plugins/ assets/js/tinymce


cp node_modules/mustache/mustache.min.* assets/js


mkdir assets/js/beautify
cp node_modules/js-beautify/js/lib/beautify*.js assets/js/beautify


mkdir assets/js/linkifyjs
cp node_modules/linkifyjs/dist/*.min.js assets/js/linkifyjs

mkdir assets/js/yaml
cp node_modules/js-yaml/dist/*.min.js assets/js/yaml

mkdir assets/js/esprima
cp node_modules/esprima/dist/*.js assets/js/esprima

mkdir assets/js/clipboard
cp node_modules/clipboard/dist/*.min.js assets/js/clipboard