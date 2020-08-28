/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, FroalaEditor, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify, tinymce */

/*global site, countlines, USE_FROLALA_EDITOR, USE_ACE, USE_CODEMIRROR, WITH_WYSIWYG_EDITOR */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TemplateEditor = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TEMPLATE_EDITOR_NAME_CODEMIRROR = 'CodeMirror';
var TEMPLATE_EDITOR_NAME_TINYMCE = 'TinyMCE';
var TEMPLATE_EDITOR_NAME_FROALAEDITOR = 'FroalaEditor';
var TEMPLATE_EDITOR_NAME_ACE = 'ace';

var TemplateEditor =
/*#__PURE__*/
function () {
  function TemplateEditor() {
    _classCallCheck(this, TemplateEditor);

    this._templateEditor = null;
    this._templateWYSIWYGEditor = null;
    this._currentWYSIWYGTemplateEditorName = '';
  }

  _createClass(TemplateEditor, [{
    key: "setTemplateError",
    value: function setTemplateError(error) {
      $('#configError').html(error).show();
    }
  }, {
    key: "clearTemplateError",
    value: function clearTemplateError() {
      $('#templateError').hide().empty();
    }
  }, {
    key: "updateTemplateLinesOfCodeBadges",
    value: function updateTemplateLinesOfCodeBadges(code) {
      var loc = countlines(code);

      if (loc > 0) {
        $('#templateEditorLinesBadge').html(site.data.strings.editor.lines.format(loc)).show();
      } else {
        $('#templateEditorLinesBadge').hide();
      }
    }
  }, {
    key: "generateTemplateWYSIWYGEditor",
    value: function generateTemplateWYSIWYGEditor() {
      var onChangeTemplate = function onChangeTemplate(value) {
        setTemplateCode(value);
        this.updateTemplateLinesOfCodeBadges(value);

        if (_enableLivePreview === true) {
          generateHTML();
        }
      };

      if (USE_FROLALA_EDITOR) {
        this._templateWYSIWYGEditor = new FroalaEditor('#txtTemplateWYSIWYG', {
          theme: 'dark',
          iconsTemplate: 'font_awesome_5',
          heightMin: 300,
          toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'specialCharacters', '|', 'textColor', 'emoticons', '|', 'paragraphFormat', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'inlineClass', 'fontAwesome', 'spellChecker', 'insertLink', 'insertImage', 'insertTable', 'undo', 'redo', 'clearFormating', 'html', 'fullscreen', 'help'],
          events: {
            contentsChanged: function contentsChanged(e, editor) {
              onChangeTemplate(editor.html.get());
            }
          }
        }, function () {
          this._templateWYSIWYGEditor.html.set(getTemplateCode());
        });
        this._currentWYSIWYGTemplateEditorName = TEMPLATE_EDITOR_NAME_FROALAEDITOR;
      } else {
        tinymce.init({
          selector: '#txtTemplateWYSIWYG',
          height: 500,
          menubar: false,
          skin: 'oxide-dark',
          plugins: ['advlist autolink lists link image charmap print preview anchor', 'searchreplace visualblocks code fullscreen', 'insertdatetime media table paste code help wordcount'],
          toolbar: 'undo redo | formatselect | ' + 'bold italic backcolor | alignleft aligncenter ' + 'alignright alignjustify | bullist numlist outdent indent | ' + 'removeformat | help',
          setup: function setup(ed) {
            ed.on('change', function (e) {
              onChangeTemplate(ed.getContent());
            });
          }
        });
        this._templateWYSIWYGEditor = tinymce.get('txtTemplateWYSIWYG');

        this._templateWYSIWYGEditor.setContent(getTemplateCode());

        this._currentWYSIWYGTemplateEditorName = TEMPLATE_EDITOR_NAME_TINYMCE;
      }
    }
  }, {
    key: "generateTemplateEditor",
    value: function generateTemplateEditor() {
      var onChangeTemplateEditor = function onChangeTemplateEditor(value) {
        setTemplateCode(value);
        this.updateTemplateLinesOfCodeBadges(value);

        if (_enableLivePreview === true) {
          generateHTML();
        }
      };

      if (USE_ACE) {
        $('#txtTemplate').replaceWith('<pre id="txtTemplate" class="pre-ace-editor"></pre>');
        this._templateEditor = ace.edit("txtTemplate"); //_templateEditor.setTheme("ace/theme/dracula");

        this._templateEditor.session.setMode("ace/mode/html");

        this._templateEditor.session.on('change', function (delta) {
          // delta.start, delta.end, delta.lines, delta.action
          onChangeTemplateEditor(this._templateEditor.getValue());
        });

        this._currentTemplateEditorName = TEMPLATE_EDITOR_NAME_ACE;
      }

      if (USE_CODEMIRROR) {
        this._templateEditor = CodeMirror.fromTextArea(document.getElementById('txtTemplate'), {
          value: getTemplateCode(),
          mode: 'text/html',
          //theme: 'dracula',
          lineNumbers: true,
          autoRefresh: true,
          lint: true,
          gutters: ["CodeMirror-lint-markers"],
          extraKeys: {
            "Ctrl-Space": "autocomplete"
          }
        });

        this._templateEditor.on('changes', function (cm, changes) {
          onChangeTemplateEditor(cm.getValue());
        });

        this._currentTemplateEditorName = TEMPLATE_EDITOR_NAME_CODEMIRROR;
      }
    }
  }, {
    key: "setTemplateEditorValue",
    value: function setTemplateEditorValue(code) {
      if (WITH_WYSIWYG_EDITOR === true) {
        if (this._currentWYSIWYGTemplateEditorName === TEMPLATE_EDITOR_NAME_TINYMCE) {
          this._templateWYSIWYGEditor.setContent(code);
        } else if (this._currentWYSIWYGTemplateEditorName === TEMPLATE_EDITOR_NAME_FROALAEDITOR) {
          this._templateWYSIWYGEditor.html.set(code);
        }
      }

      this._templateEditor.setValue(code);

      this.updateTemplateLinesOfCodeBadges(code);

      if (USE_ACE) {
        this._templateEditor.clearSelection();
      }

      if (USE_CODEMIRROR) {
        //setTimeout(function () {
        this._templateEditor.refresh(); //}, 100);

      }
    }
  }, {
    key: "initEditor",
    value: function initEditor() {
      var templateCode = getTemplateCode();
      this.setTemplateEditorValue(templateCode);
      this.updateTemplateLinesOfCodeBadges(templateCode);
    }
  }, {
    key: "refresh",
    value: function refresh() {
      if (USE_CODEMIRROR) {
        //setTimeout(function () {
        _this.templateEditor.refresh(); //}, 100);

      }
    }
  }, {
    key: "enableWYSIWYGEditor",
    value: function enableWYSIWYGEditor() {
      _enableWYSIWYGTemplateEditor = true;
      localStorage.setItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR, _enableWYSIWYGTemplateEditor);
      initEditor();
      $('.main-template-editors-editor-container').hide();
      $('.main-template-editors-WYSIWYG-editor-container').show();
      $('#btnEnableWYSIWYGEditor').html(site.data.strings.editor.template.enabled_WYSIWYG_editor_btn).attr('class', 'btn btn-secondary');
    }
  }, {
    key: "disableWYSIWYGEditor",
    value: function disableWYSIWYGEditor() {
      _enableWYSIWYGTemplateEditor = false;
      localStorage.setItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR, _enableWYSIWYGTemplateEditor);
      initEditor();
      $('.main-template-editors-editor-container').show();
      $('.main-template-editors-WYSIWYG-editor-container').hide();
      $('#btnEnableWYSIWYGEditor').html(site.data.strings.editor.template.disabled_WYSIWYG_editor_btn).attr('class', 'btn btn-outline-secondary');
    }
  }]);

  return TemplateEditor;
}();

exports.TemplateEditor = TemplateEditor;