/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, ace, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify */

/*global USE_ACE, USE_CODEMIRROR */
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

    this._codePreviewEditor = null;
  }

  _createClass(PreviewEditor, [{
    key: "generateCodePreviewEditor",
    value: function generateCodePreviewEditor() {
      if (USE_ACE) {
        $('#txtPreviewCode').replaceWith('<pre id="txtPreviewCode" class="pre-ace-editor"></pre>');
        this._codePreviewEditor = ace.edit("txtPreviewCode"); //this._codePreviewEditor.setTheme("ace/theme/dracula");

        this._codePreviewEditor.session.setMode("ace/mode/html");

        this._codePreviewEditor.setReadOnly(true);
      }

      if (USE_CODEMIRROR) {
        this._codePreviewEditor = CodeMirror.fromTextArea(document.getElementById('txtPreviewCode'), {
          mode: 'text/html',
          //theme: 'dracula',
          lineNumbers: true,
          readOnly: true,
          autoRefresh: true
        });
      }
    }
  }, {
    key: "setCodePreview",
    value: function setCodePreview(code) {
      _codePreview = code;

      this._codePreviewEditor.setValue(code);

      if (USE_ACE) {
        this._codePreviewEditor.clearSelection();
      }

      if (USE_CODEMIRROR) {
        //setTimeout(function () {
        this._codePreviewEditor.refresh(); //}, 100);

      }
    }
  }]);

  return PreviewEditor;
}();

exports.PreviewEditor = PreviewEditor;