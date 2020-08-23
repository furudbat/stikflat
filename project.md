---
layout: page
---

{{ site.title }} is a Tool to generating HTML-Code with template engine magic.  
There are some basic Layouts and Codesnippets you can use and edit.  

### Features

 - preset Layouts choose from
 - edit content via JSON or YAML
 - lock config, switch Layouts
 - save/load configs
 - generate HTML, with spoiler and preview (copy to clipboard)
 - show Hints while editing
 - edit template and CSS

#### How to 

 1. Select a layout by double-click
 2. Edit the config
 3. generate HTML-Code

A lot of Layouts has the same content like `title`, `name`, `age`, `gender`, so you can switch easier between them. 

#### Screenshots and Screencasts

<div id="carouselScreenshots" class="carousel slide w-80" data-ride="carousel">
  <ol class="carousel-indicators">
    <li data-target="#carouselScreenshots" data-slide-to="0" class="active"></li>
    <li data-target="#carouselScreenshots" data-slide-to="1"></li>
    <li data-target="#carouselScreenshots" data-slide-to="2"></li>
    <li data-target="#carouselScreenshots" data-slide-to="3"></li>
  </ol>
  <div class="carousel-inner border" style="height: 950px">
    <div class="carousel-item active">
      <img class="d-block w-100" alt="Screenshot 2" src="{{ '/screenshots/1.png' | relative_url }}">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" alt="Screenshot 2" src="{{ '/screenshots/2.png' | relative_url }}">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" alt="Screenshot 3" src="{{ '/screenshots/3.png' | relative_url }}">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" alt="Screenshot 4" src="{{ '/screenshots/4.png' | relative_url }}">
    </div>
  </div>
  <a class="carousel-control-prev" href="#carouselScreenshots" role="button" data-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="sr-only">Previous</span>
  </a>
  <a class="carousel-control-next" href="#carouselScreenshots" role="button" data-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="sr-only">Next</span>
  </a>
</div>

<div id="screencasts" class="w-80 mt-2 mb-2">
  <div class="card">
    <div class="card-header" id="headingFeature1">
      <h5 class="mb-0">
        <button class="btn btn-link btn-sm" data-toggle="collapse" data-target="#collapseFeature1" aria-expanded="false" aria-controls="collapseFeature1">
          Generate HTML-Code
        </button>
      </h5>
    </div>

    <div id="collapseFeature1" class="collapse" aria-labelledby="headingFeature1" data-parent="#screencasts">
      <div class="card-body w-80">
        <div class="figure mx-auto">
            <img class="figure-img img-fluid border rounded" alt="Generate HTML-Code" src="{{ '/screenshots/generate.gif' | relative_url }}">
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header" id="headingFeature2">
      <h5 class="mb-0">
        <button class="btn btn-link btn-sm" data-toggle="collapse" data-target="#collapseFeature2" aria-expanded="false" aria-controls="collapseFeature2">
          Edit Layout with Config
        </button>
      </h5>
    </div>

    <div id="collapseFeature2" class="collapse" aria-labelledby="headingFeature2" data-parent="#screencasts">
      <div class="card-body w-80">
        <div class="figure mx-auto">
            <img class="figure-img img-fluid border rounded" alt="Edit Layout with Config" src="{{ '/screenshots/layout.gif' | relative_url }}">
        </div>
      </div>
    </div>
  </div>
  
  <div class="card">
    <div class="card-header" id="headingFeature3">
      <h5 class="mb-0">
        <button class="btn btn-link btn-sm" data-toggle="collapse" data-target="#collapseFeature3" aria-expanded="false" aria-controls="collapseFeature3">
          Edit more Complex Layouts/Snippets
        </button>
      </h5>
    </div>

    <div id="collapseFeature3" class="collapse" aria-labelledby="headingFeature3" data-parent="#screencasts">
      <div class="card-body w-80">
        <div class="figure mx-auto">
            <img class="figure-img img-fluid border rounded" alt="Edit Layout with Config" src="{{ '/screenshots/complex1.gif' | relative_url }}">
        </div>
      </div>
    </div>
  </div>
</div>


### Links

Checkout my Layouts on [TOYHOU.SE](https://toyhou.se/~forums/16.htmlcss-graphics/160772.-furus-coding-cave-html-and-codesnippets), thx <3