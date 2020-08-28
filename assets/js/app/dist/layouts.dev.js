"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Layouts = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify, jsyaml, List */

/*global site */
var SCROLL_TO_ANIMATION_TIME_MS = 600;

var Layouts =
/*#__PURE__*/
function () {
  function Layouts() {
    _classCallCheck(this, Layouts);
  }

  _createClass(Layouts, [{
    key: "loadLayout",
    value: function loadLayout(layout, callback) {
      var id = $(layout).data('id');
      var layoutLoading = $('#layout-loading-' + id);
      layoutLoading.show();
      $.ajax({
        url: $(layout).data('meta'),
        method: "GET",
        cache: USE_CACHE
      }).done(function (metaRes) {
        var meta = jsyaml.load(metaRes);
        var name = meta.name;
        var configlink = $(layout).data('config');
        var getConfig = $.ajax({
          url: configlink,
          method: "GET",
          cache: USE_CACHE
        });
        var getTemplate = $.ajax({
          url: $(layout).data('template'),
          method: "GET",
          cache: USE_CACHE
        });
        var getCSS = $.ajax({
          url: $(layout).data('css'),
          method: "GET",
          cache: USE_CACHE
        });
        $.when(getTemplate, getConfig, getCSS).done(function (templateRes, configRes, cssRes) {
          layoutLoading.hide();
          console.log({
            template: templateRes[0],
            config: configRes[0],
            css: cssRes[0],
            meta: meta,
            name: name,
            configlink: configlink
          });
          callback({
            template: templateRes[0],
            config: configRes[0],
            css: cssRes[0],
            meta: meta,
            name: name,
            configlink: configlink
          });
        }).fail(function () {
          layoutLoading.hide();
        });
      }).fail(function () {
        layoutLoading.hide();
      });
    }
  }, {
    key: "generateLayoutList",
    value: function generateLayoutList() {
      var templates = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = site.data.templates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var template = _step.value;

          if ('disable' in template && template.disable == true || 'disabled' in template && template.disabled == true) {
            continue;
          }

          var type = '';

          if (template.type == 'character') {
            type = '<span  class="badge badge-pill badge-success">' + site.data.strings.layouts.type_character + '</span>';
          } else if (template.type == 'user') {
            type = '<span class="badge badge-pill badge-warning">' + site.data.strings.layouts.type_user + '</span>';
          } else if (template.type == 'codesnippet') {
            type = '<span class="badge badge-pill badge-info">' + site.data.strings.layouts.type_codesnippet + '</span>';
          } else {
            type = '<span class="badge badge-pill badge-danger">' + template.type + '</span>';
          }

          var style = template.style;
          var preview = '';
          var previewstyle = '';
          var cardbodystyle = '';
          var inlinebodystyle = '';
          var inlineauthorstyle = '';
          var colstyle = '';

          if ('preview' in template && template.preview) {
            colstyle = 'flex: 0 0 25%; max-width: 25%;';
            style = 'width: 14rem; min-height: 320px;' + template.style;
            previewstyle = 'min-height: 200px;';
            preview = '<img class="card-img-top" style="max-height: 200px;" src="' + template.preview + '" alt="Preview ' + template.name + '">';
          } else {
            colstyle = 'margin: 0.25rem;';
            cardbodystyle = 'padding: 0.25rem';
            inlinebodystyle = 'display: inline !important;';
            inlineauthorstyle = 'display: inline !important;';
          }

          templates.push({
            colstyle: colstyle,
            style: style,
            template: site.data.templates_url + template.template,
            css: site.data.templates_url + template.css,
            config: site.data.templates_url + template.config,
            meta: site.data.templates_url + template.meta,
            keywords: template.keywords.join(', '),
            id: template.id,
            preview: preview,
            previewstyle: previewstyle,
            cardbodystyle: cardbodystyle,
            inlinebodystyle: inlinebodystyle,
            inlineauthorstyle: inlineauthorstyle,
            name: template.name,
            layoutloadingid: 'layout-loading-' + template.id,
            type: type,
            author: site.data.strings.layouts.by_author + template.author
          });
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var item = "<div class=\"d-inline colstyle\" style=\"\">\n            <button type=\"button\" class=\"btn btn-link card d-inline mr-1 mb-1 layout-pattern style template meta css config keywords id\" \n                style=\"\" data-template=\"\" data-css=\"\" data-config=\"\" data-meta=\"\" data-id=\"\" data-keywords=\"\">\n                <div class=\"d-flex flex-wrap align-items-center preview previewstyle\" style=\"\">\n                </div>\n                <div class=\"card-body cardbodystyle\">\n                    <div class=\"spinner-border layoutloadingid\" style=\"display: none\" role=\"status\" id=\"\">\n                        <span class=\"sr-only\">Loading...</span>\n                    </div>\n                    <p class=\"card-text inlinebodystyle\">\n                        <span class=\"text-left name\"></span>\n                        <span class=\"text-right type\"></span>\n                    </p>\n                    <p class=\"card-subtitle author inlineauthorstyle\"></p>\n                </div>\n            </div>\n        </div>";
      var options = {
        valueNames: ['preview', 'name', 'type', 'author', {
          name: 'template',
          attr: 'data-template'
        }, {
          name: 'css',
          attr: 'data-css'
        }, {
          name: 'config',
          attr: 'data-config'
        }, {
          name: 'meta',
          attr: 'data-meta'
        }, {
          name: 'keywords',
          attr: 'data-keywords'
        }, {
          name: 'id',
          attr: 'data-id'
        }, {
          name: 'layoutloadingid',
          attr: 'id'
        }, {
          name: 'colstyle',
          attr: 'style'
        }, {
          name: 'style',
          attr: 'style'
        }, {
          name: 'previewstyle',
          attr: 'style'
        }, {
          name: 'cardbodystyle',
          attr: 'style'
        }, {
          name: 'inlinebodystyle',
          attr: 'style'
        }, {
          name: 'inlineauthorstyle',
          attr: 'style'
        }],
        item: item,
        page: 10,
        pagination: [{
          paginationClass: "paginationBottom",
          innerWindow: 5,
          left: 2,
          right: 2
        }]
      };
      this.layoutsList = new List('layouts-list', options, templates);
      var that = this;

      var overrideLayout = function overrideLayout(layout) {
        //console.debug('layout-pattern dblclick', layout);
        that.loadLayout(layout, function (data) {
          var keywordsStr = $(layout).data('keywords'); //console.debug('overrideLayout', 'loadLayout', data);

          updateLayoutInfo(data.meta);
          var template = data.template;
          var css = data.css;
          var config = data.config;

          if (_lockConfigCode === true) {
            config = _configJson;
          }

          var configJson = {};

          try {
            if (typeof config === 'string' || config instanceof String) {
              configJson = jsonlint.parse(config, null, 4);
            } else {
              configJson = config;
            }
          } catch (e) {
            console.error(e);
          }

          setTemplateCode(template);
          setConfigJson(configJson);
          updateConfigCodesStr();
          setCssCode(css_beautify(css));
          initEditors();
          generateHTML();
          var keywordsArr = keywordsStr.split(", ").map(Function.prototype.call, String.prototype.trim);
          var keywords = keywordsArr.map(function (it) {
            return "<code>".concat(it, "</code>");
          }).join(', ');
          $('#configHelpKeywords').html(site.data.strings.editor.config.keywords_help.format(keywords, data.configlink));
          /*
          if ($('#previewTabContent').hasClass('show')) {
              selectTemplateTab();
          }
          */

          if (!isOnScreen('.main-template-editors-preview-container') || isOnScreen('.main-template-editors-preview-container', 1.0, 0.45)) {
            $('html, body').animate({
              scrollTop: $('#sectionEditor').offset().top
            }, SCROLL_TO_ANIMATION_TIME_MS);
          }
        });
      };

      var previewLayout = function previewLayout(layout) {
        //console.debug('layout-pattern click', layout);
        loadLayout(layout, function (data) {
          //console.debug('previewLayout', 'loadLayout', data);
          updateLayoutInfo(data.meta);
          generateHTMLFromTemplate(data.template, data.config, data.css, true);
          selectPreviewTab();
        });
      };

      this.layoutsList.on('updated', function () {
        makeDoubleClick($('.layout-pattern'), overrideLayout, previewLayout);
      });
      makeDoubleClick($('.layout-pattern'), overrideLayout, previewLayout);
    }
  }]);

  return Layouts;
}();

exports.Layouts = Layouts;