/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Preview = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Preview =
/*#__PURE__*/
function () {
  function Preview() {
    _classCallCheck(this, Preview);
  }

  _createClass(Preview, [{
    key: "enableLivePreview",
    value: function enableLivePreview() {
      _enableLivePreview = true;
      localStorage.setItem(STORAGE_KEY_ENABLE_LIVE_PREVIEW, _enableLivePreview);
      $('#chbLivePreviewHelp').html(site.data.strings.editor.template.enabled_live_preview_help);
    }
  }, {
    key: "disableLivePreview",
    value: function disableLivePreview() {
      _enableLivePreview = false;
      localStorage.setItem(STORAGE_KEY_ENABLE_LIVE_PREVIEW, _enableLivePreview);
      $('#chbLivePreviewHelp').html(site.data.strings.editor.template.disabled_live_preview_help);
    }
  }, {
    key: "setHTMLPreview",
    value: function setHTMLPreview(htmlstr, css) {
      var html = $.parseHTML('<style>' + css + '</style>' + htmlstr);
      $('#preview-html').html(html);
    }
  }]);

  return Preview;
}();

exports.Preview = Preview;