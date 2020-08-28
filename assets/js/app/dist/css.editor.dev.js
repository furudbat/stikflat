/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, ace, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify */

/*global site, countlines, USE_ACE, USE_CODEMIRROR */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PreviewEditor = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PreviewEditor =
/*#__PURE__*/
function () {
  function PreviewEditor() {
    _classCallCheck(this, PreviewEditor);

    this._cssEditor = null;
  }

  _createClass(PreviewEditor, [{
    key: "generateCssEditor",
    value: function generateCssEditor() {
      var that = this;

      var onChangeCSS = function onChangeCSS(value) {
        setCssCode(value);
        that.updateCssLinesOfCodeBadges(value);

        if (_enableLivePreview === true) {
          generateHTML();
        }
      };

      if (USE_ACE) {
        $('#txtCSS').replaceWith('<pre id="txtCSS" class="pre-ace-editor"></pre>');
        this._cssEditor = ace.edit("txtCSS"); //_cssEditor.setTheme("ace/theme/dracula");

        this._cssEditor.session.setMode("ace/mode/json");

        this._cssEditor.session.on('change', function (delta) {
          // delta.start, delta.end, delta.lines, delta.action
          onChangeCSS(that._cssEditor.getValue());
        });
      }

      if (USE_CODEMIRROR) {
        this._cssEditor = CodeMirror.fromTextArea(document.getElementById('txtCSS'), {
          value: getCssCode(),
          mode: 'text/css',
          //theme: 'dracula',
          //lineNumbers: true,
          linter: true,
          autoRefresh: true
        });

        this._cssEditor.on('changes', function (cm, changes) {
          onChangeCSS(cm.getValue());
        });
      }
    }
  }, {
    key: "updateCssLinesOfCodeBadges",
    value: function updateCssLinesOfCodeBadges(code) {
      var loc = countlines(code);

      if (loc > 0) {
        $('#cssEditorLinesBadge').html(site.data.strings.editor.lines.format(loc)).show();
      } else {
        $('#cssEditorLinesBadge').hide();
      }
    }
  }, {
    key: "refresh",
    value: function refresh() {
      if (USE_CODEMIRROR) {
        //setTimeout(function () {
        this._cssEditor.refresh(); //}, 100);

      }
    }
  }, {
    key: "initEditors",
    value: function initEditors() {
      var cssCode = getCssCode();

      this._cssEditor.setValue(cssCode);

      this.updateCssLinesOfCodeBadges(cssCode);

      if (USE_ACE) {
        this._cssEditor.clearSelection();
      } else if (USE_CODEMIRROR) {
        //setTimeout(function () {
        this._cssEditor.refresh(); //}, 100);

      }
    }
  }]);

  return PreviewEditor;
}();

exports.PreviewEditor = PreviewEditor;