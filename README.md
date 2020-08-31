# stikflat - Glue your custom Theme and Content together

stikflat is a Tool to generating HTML-Code with template engine magic.  
There are some basic Layouts and Codesnippets you can use and edit.  

## Features

 - preset Layouts choose from
 - edit content via JSON or YAML
 - lock config, switch Layouts
 - save/load configs
 - generate HTML, with spoiler and preview (copy to clipboard)
 - show Hints while editing
 - edit template and CSS


### Screenshots

![Generate](/screenshots/generate.gif)


## What it does

 - copy a pre-made template and config into the editor
 - combine template and config and preview the combined HTML

## What it does not

 - It's not magic
 - Not ALL keywords or "features" are available in all the templates (check the original config of the Layout)
 - Most of the Layout just replace "Text XY and content" with the value in your config, adding new custom HTML you need to do by your own
 - "convert" you existing HTML-Code into a template

This tool doen't solve all your problemes, you can use the generated HTML-code as a base and edit complex `bio`, `about`, `entires`, ... your self afterwards.

### Problems ?

 - _See an Error under your config ?_  
Don't panik maybe you have an typo in your config, it's need to be the right syntax (JSON/YAML).
 - _Don't see your value in the Preview ?_
Maybe this Layout doen't support a specific keyword (see [see under config editor](/screenshots/config_help.png))


## Where is my Layout ?

You can find ALL the Layouts in the `templates/`-folder.  
Every Layout has one `*.html` (mustache template), one `config.json` (original config), a `*.css` file (custom CSS) and some Metadata about the layout and creator (`meta.yaml`).


## Run

Well to just run this project on your local machine, you need [Jekyll](https://jekyllrb.com/) and run `bundle exec jekyll serve`.  


## Requirements (for development)

 - [node](https://www.npmjs.com/get-npm)
 - [python](https://www.python.org/) (for scripts)

### install dependencies

run `npm install` and `pip install -r requirements.txt`


## Build

run `npm run build` (for production code) or `npm run build-dev` (for development code), when you are running `bundle exec jekyll serve` its uses development code.  

or just run `./build.sh`

### templates

When you are adding new templates, you need to update the templates-list, just run `python ./scripts/gen_data_templates.py`




## Powered by Boostrap 4 Github Pages

A [Bootstrap 4](https://getbootstrap.com/) start up project for [Github Pages](https://pages.github.com/) and [Jekyll](https://jekyllrb.com/).

* A full Bootstrap 4 theme usable both on Github Pages and with a standalone Jekyll.
* Recompiles Bootstrap from SCSS files, which allows to customize Bootstrap's variables and use Bootstrap themes.
* Full support of Bootstrap's JavaScript plugins.
* Supports all features of Github Pages and Jekyll.

[See the website for demonstration and documentation](https://nicolas-van.github.io/bootstrap-4-github-pages/).

## License

[See the license file.](./LICENSE.md)
