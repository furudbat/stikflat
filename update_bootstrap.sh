#! /bin/sh

# A useful script to download the latest version of bootstrap and jquery

rm -rf node_modules package-lock.json
npm install bootstrap@4 jquery@3
npm install bootstrap-toggle font-awesome jquery-ui
npm install froala-editor codemirror codemirror-spell-checker
npm install mustache

cp -r node_modules/bootstrap/scss/* _sass/bootstrap
cp node_modules/bootstrap/dist/js/bootstrap.bundle.min.* assets/js/
cp node_modules/jquery/dist/jquery.min.* assets/js/

cp node_modules/bootstrap-toggle/js/bootstrap-toggle.min.* assets/js/
cp node_modules/bootstrap-toggle/css/bootstrap-toggle.min.* assets/css/

cp node_modules/froala-editor/js/froala_editor.pkgd.min.* assets/js/
cp node_modules/froala-editor/js/plugins/*.min.js assets/js/plugins/
cp node_modules/froala-editor/js/third_party/*.min.css assets/js/third_party/
cp node_modules/froala-editor/css/froala_editor.pkgd.min.* assets/css/
cp node_modules/froala-editor/css/plugins/*.min.css assets/css/plugins/
cp node_modules/froala-editor/css/themes/*.min.css assets/css/themes/

cp node_modules/mustache/mustache.min.* assets/js/

cp node_modules/codemirror/lib/*.js assets/js/
cp node_modules/codemirror/mode/ assets/js/
cp node_modules/codemirror/addon/ assets/js/
cp node_modules/codemirror/lib/*.css assets/css/