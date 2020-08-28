/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify, jsyaml, jsonlint */

/*global site, WITH_WYSIWYG_EDITOR */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Application = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Application =
/*#__PURE__*/
function () {
  function Application() {
    _classCallCheck(this, Application);
  }

  _createClass(Application, [{
    key: "clearLayoutInfo",
    value: function clearLayoutInfo() {
      $('#msgLayoutPatternInfo').hide();
    }
  }, {
    key: "updateLayoutInfo",
    value: function updateLayoutInfo(meta) {
      if (meta === null) {
        console.error('updateLayoutInfo', 'meta is null');
        return;
      }

      this._currentLayoutId = meta.id;
      var author = meta.author || '&lt;Unknown&gt;';
      var authorLink = meta.author_link || '';
      var description = meta.description || '';
      var link = meta.link || '';
      var name = meta.name || link;
      var license = meta.license || '';
      var more = meta.more || '';
      var header = link === '' ? name : '<a href="' + link + '" target="_blank">' + name + '</a>';
      header += site.data.strings.info.by_author + '<a href="' + authorLink + '" target="_blank">' + author + '</a>';
      $('#msgLayoutPatternInfoHeader').html(header);
      $('#msgLayoutPatternInfoDescription').html(description);
      $('#msgLayoutPatternInfoLicense').html(license);
      $('#msgLayoutPatternInfoMore').html(more);
      $('#msgLayoutPatternInfo').show();
    }
  }, {
    key: "initEditors",
    value: function initEditors() {}
  }, {
    key: "generateHTMLFromTemplate",
    value: function generateHTMLFromTemplate(template, json, css) {
      var onlypreview = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      if (typeof json === 'string' || json instanceof String) {
        clearConfigError();

        try {
          if (json !== '') {
            json = jsonlint.parse(json);
          }
        } catch (error) {
          json = {};
          var html = error.toString();

          if (onlypreview === true) {
            setHTMLPreview(html, css);
          } else {
            setConfigError(html);
          }
        }
      }

      if (json !== null) {
        clearTemplateError();

        try {
          var htmlstr = Mustache.render(template, json);
          setHTMLPreview(htmlstr, css);

          if (onlypreview === false) {
            setCodePreview(html_beautify(htmlstr));
          }
        } catch (error) {
          console.error(error);

          if (onlypreview === true) {
            setHTMLPreview(error.toString(), css);
          } else {
            setTemplateError(error.toString());
            setHTMLPreview(error.toString(), css);
            setCodePreview(error.toString());
          }
        }
      }
    }
  }, {
    key: "generateHTML",
    value: function generateHTML() {
      var template = getTemplateCode();
      var json = getConfigCodeJSON();
      var css = getCssCode();
      generateHTMLFromTemplate(template, json, css);
    }
  }, {
    key: "changeConfigMode",
    value: function changeConfigMode(mode) {
      updateConfigCodesStr();
      setCodeContentMode(mode);
      initEditor();
    }
  }, {
    key: "selectPreviewTab",
    value: function selectPreviewTab() {
      $('#templateTabs a[href="#previewTabContent"]').tab('show');
    }
  }, {
    key: "selectTemplateTab",
    value: function selectTemplateTab() {
      $('#templateTabs a[href="#templateTabContent"]').tab('show');

      if (USE_CODEMIRROR) {
        //setTimeout(function () {
        _templateEditor.refresh(); //}, 100);

      }
    }
  }, {
    key: "selectCssTab",
    value: function selectCssTab() {
      $('#templateTabs a[href="#cssTabContent"]').tab('show');

      if (USE_CODEMIRROR) {
        //setTimeout(function () {
        _cssEditor.refresh(); //}, 100);

      }
    }
  }, {
    key: "init",
    value: function init() {
      loadFromStorage();
      setTemplateCode(_templateCode);
      setConfigJson(_configJson);
      setCssCode(_cssCode);
      generateLayoutList();
      generateSavedConfigsFromList();
      initSaveConfigControls();
      clearConfigError();
      clearTemplateError();
      clearLayoutInfo();
      $('#templateEditorLinesBadge').hide();
      $('#cssEditorLinesBadge').hide();
      generateTemplateEditor();

      if (WITH_WYSIWYG_EDITOR === true) {
        generateTemplateWYSIWYGEditor();
      }

      generateConfigEditor();
      generateCssEditor();
      generateCodePreviewEditor();

      if (getConfigContentMode() === CONFIG_CONTENT_MODE_YAML) {
        $('#chbConfigMode').bootstrapToggle('on');
        changeConfigMode(CONFIG_CONTENT_MODE_YAML);
      } else {
        $('#chbConfigMode').bootstrapToggle('off');
        changeConfigMode(CONFIG_CONTENT_MODE_JSON);
      }

      generateHTML();

      if (_lockConfigCode === true) {
        $('#chbLockConfig').bootstrapToggle('on');
        lockConfig();
      } else {
        $('#chbLockConfig').bootstrapToggle('off');
        unlockConfig();
      }

      if (_enableLivePreview === true) {
        $('#chbLivePreview').prop('checked', true);
        enableLivePreview();
      } else {
        $('#chbLivePreview').prop('checked', false);
        disableLivePreview();
      }

      if (WITH_WYSIWYG_EDITOR === true) {
        if (_enableWYSIWYGTemplateEditor === true) {
          enableWYSIWYGEditor();
        } else {
          disableWYSIWYGEditor();
        }
      } else {
        disableWYSIWYGEditor();
      }
      /*
      if (getTemplateCode() === '') {
          selectPreviewTab();
      } else {
          selectTemplateTab();
      }
      */


      var btnPreviewCodeCopy = new ClipboardJS('#btnPreviewCodeCopy', {
        text: function text(trigger) {
          return _codePreview;
        }
      });
      btnPreviewCodeCopy.on('success', function (e) {
        $('#btnPreviewCodeCopy').popover('show');
        e.clearSelection();
      });
      var btnPreviewCodeCopySpoiler = new ClipboardJS('#btnPreviewCodeCopySpoiler', {
        text: function text(trigger) {
          var code = _codePreview;
          var encoded_code = $('<div />').text(code).html();
          return ['<div class="fr-spoiler">', '<pre><code>', encoded_code, '</pre></code>', '</div>'].join('\n');
        }
      });
      btnPreviewCodeCopySpoiler.on('success', function (e) {
        $('#btnPreviewCodeCopySpoiler').popover('show');
        e.clearSelection();
      });
      var btnPreviewCodeCopySpoilerPreview = new ClipboardJS('#btnPreviewCodeCopySpoilerPreview', {
        text: function text(trigger) {
          var code = _codePreview;
          var encoded_code = $('<div />').text(code).html();
          return ['<h2>Code</h2>', '<div class="fr-spoiler">', '<pre><code>', encoded_code, '</pre></code>', '</div>', '', '<h2>Preview</h2>', code].join('\n');
        }
      });
      btnPreviewCodeCopySpoilerPreview.on('success', function (e) {
        $('#btnPreviewCodeCopySpoilerPreview').popover('show');
        e.clearSelection();
      });
      var btnPreviewCodeCopySpoilerPreviewCredit = new ClipboardJS('#btnPreviewCodeCopySpoilerPreviewCredit', {
        text: function text(trigger) {
          var code = _codePreview;
          var encoded_code = $('<div />').text(code).html();
          return ['<p>', $('#msgLayoutPatternInfo').html(), '</p>', '', '<h2>Code</h2>', '<div class="fr-spoiler">', '<pre><code>', encoded_code, '</pre></code>', '</div>', '', '<h2>Preview</h2>', code].join('\n');
        }
      });
      btnPreviewCodeCopySpoilerPreviewCredit.on('success', function (e) {
        $('#btnPreviewCodeCopySpoilerPreviewCredit').popover('show');
        e.clearSelection();
      });
      $('[data-toggle="popover"]').popover();
      $('.copy-to-clipboard[data-toggle="popover"]').on('shown.bs.popover', function () {
        var $pop = $(this);
        setTimeout(function () {
          $pop.popover('hide');
        }, 1200);
      });
      $('#collapseConfig').collapse('show');
      $('.main-template-editors-preview-container').resizable();
      $('#templateTabs a[href="#previewTabContent"]').on('click', function (e) {
        selectPreviewTab();
      });
      $('#templateTabs a[href="#templateTabContent"]').on('click', function (e) {
        selectTemplateTab();
      });
      $('#templateTabs a[href="#cssTabContent"]').on('click', function (e) {
        selectCssTab();
      });

      if (WITH_WYSIWYG_EDITOR === true) {
        $('#btnEnableWYSIWYGEditor').click(function () {
          enableWYSIWYGTemplateEditor = !_enableWYSIWYGTemplateEditor;

          if (_enableWYSIWYGTemplateEditor === true) {
            enableWYSIWYGEditor();
          } else {
            disableWYSIWYGEditor();
          }
        });
      }

      $('#chbLivePreview').change(function () {
        var checked = $(this).prop('checked');

        if (checked === true) {
          enableLivePreview();
        } else {
          disableLivePreview();
        }
      });
      $('#chbLockConfig').change(function () {
        var checked = $(this).prop('checked');

        if (checked === true) {
          lockConfig();
        } else {
          unlockConfig();
        }
      });
      $('#chbConfigMode').change(function () {
        var checked = $(this).prop('checked');

        if (checked === true) {
          changeConfigMode(CONFIG_CONTENT_MODE_YAML);
        } else {
          changeConfigMode(CONFIG_CONTENT_MODE_JSON);
        }
      });
      $('.generate-btn').each(function (index) {
        $(this).click(function () {
          generateHTML();
          $('html, body').animate({
            scrollTop: $('#sectionPreviewCode').offset().top
          }, SCROLL_TO_ANIMATION_TIME_MS);
        });
      });
      $('#btnClearTemplateStorage').click(function () {
        clearTemplateStorage();
      });
      $('#btnClearSavedConfigsStorage').click(function () {
        clearSavedConfigsStorage();
      });
      $('#collapseConfig').on('show.bs.collapse', function () {
        $('.main-template-editors-preview-container').removeClass('bigger-preview');
        $('.main-config-editors-container').removeClass(function (index, className) {
          return (className.match(/(^|\s)col-\S+/g) || []).join(' ');
        }).addClass('col-md-4');
        $('.main-template-editors-container').removeClass(function (index, className) {
          return (className.match(/(^|\s)col-\S+/g) || []).join(' ');
        }).addClass('col-md-8');
      });
      $('#collapseConfig').on('shown.bs.collapse', function () {
        $('#btnCollapseConfig').html(site.data.strings.editor.config.header).attr('class', 'btn btn-primary');
        $('.main-config-add-container').show();
        updateSaveConfigControls();
      });
      $('#collapseConfig').on('hidden.bs.collapse', function () {
        $('.main-config-editors-container').removeClass(function (index, className) {
          return (className.match(/(^|\s)col-\S+/g) || []).join(' ');
        }).addClass('col-md-2');
        $('.main-template-editors-container').removeClass(function (index, className) {
          return (className.match(/(^|\s)col-\S+/g) || []).join(' ');
        }).addClass('col-md-10');
        $('.main-template-editors-preview-container').addClass('bigger-preview');
      });
      $('#collapseConfig').on('hide.bs.collapse', function () {
        $('#btnCollapseConfig').html(site.data.strings.editor.config.header_short).attr('class', 'btn btn-secondary');
        $('.main-config-add-container').hide();
      });
    }
  }]);

  return Application;
}();

exports.Application = Application;