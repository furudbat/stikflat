/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, FroalaEditor, ace, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify, tinymce, jsonlint, jsyaml */

/*global site, countlines, USE_FROLALA_EDITOR, USE_ACE, USE_CODEMIRROR */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfigEditor = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ConfigEditor =
/*#__PURE__*/
function () {
  function ConfigEditor(app) {
    _classCallCheck(this, ConfigEditor);

    this.app = app;
    this._configEditorJSON = null;
    this._configEditorYAML = null;
  }

  _createClass(ConfigEditor, [{
    key: "setConfigError",
    value: function setConfigError(error) {
      $('#configError').html(error).show();
      updateSaveConfigControls();
    }
  }, {
    key: "clearConfigError",
    value: function clearConfigError() {
      $('#configError').hide().empty();
      updateSaveConfigControls();
    }
  }, {
    key: "generateConfigEditor",
    value: function generateConfigEditor() {
      var that = this;

      var onChangeConfigJSON = function onChangeConfigJSON(value) {
        _configJsonStr = value;
        localStorage.setItem(STORAGE_KEY_CONFIG_CODE_JSON, _configJsonStr);

        try {
          if (_configJsonStr !== '') {
            var config = jsonlint.parse(_configJsonStr);
            setConfigJson(config);

            if (_enableLivePreview === true) {
              generateHTML();
            }
          }
        } catch (error) {
          that.setConfigError(error.toString());
        }
      };

      var onChangeConfigYAML = function onChangeConfigYAML(value) {
        _configYamlStr = value;
        localStorage.setItem(STORAGE_KEY_CONFIG_CODE_YAML, _configYamlStr);

        try {
          if (_configYamlStr !== '') {
            var config = jsyaml.load(_configYamlStr);
            setConfigJson(config);

            if (_enableLivePreview === true) {
              generateHTML();
            }
          }
        } catch (error) {
          this.setConfigError(error.toString());
        }
      };

      if (USE_ACE) {
        $('#txtConfigJSON').replaceWith('<pre id="txtConfigJSON" class="pre-ace-editor"></pre>');
        this._configEditorJSON = ace.edit("txtConfigJSON"); //this._configEditorJSON.setTheme("ace/theme/dracula");

        this._configEditorJSON.session.setMode("ace/mode/json");

        this._configEditorJSON.session.on('change', function (delta) {
          // delta.start, delta.end, delta.lines, delta.action
          onChangeConfigJSON(that._configEditorJSON.getValue());
        });

        $('#txtConfigYAML').replaceWith('<pre id="txtConfigYAML" class="pre-ace-editor"></pre>');
        this._configEditorYAML = ace.edit("txtConfigYAML"); //this._configEditorYAML.setTheme("ace/theme/dracula");

        this._configEditorYAML.session.setMode("ace/mode/yaml");

        this._configEditorYAML.session.on('change', function (delta) {
          // delta.start, delta.end, delta.lines, delta.action
          onChangeConfigYAML(that._configEditorYAML.getValue());
        });
      }

      if (USE_CODEMIRROR) {
        this._configEditorJSON = CodeMirror.fromTextArea(document.getElementById('txtConfigJSON'), {
          value: _configJsonStr || getConfigCodeJSON(),
          mode: CONFIG_CONTENT_MODE_JSON,
          //theme: 'dracula',
          lineNumbers: true,
          lint: true,
          gutters: ["CodeMirror-lint-markers"],
          spellcheck: true,
          autoRefresh: true
        });

        this._configEditorJSON.on('changes', function (cm, changes) {
          onChangeConfigJSON(cm.getValue());
        });

        this._configEditorYAML = CodeMirror.fromTextArea(document.getElementById('txtConfigYAML'), {
          value: _configYamlStr || getConfigCodeYAML(),
          mode: CONFIG_CONTENT_MODE_YAML,
          //theme: 'dracula',
          lineNumbers: true,
          lint: true,
          gutters: ["CodeMirror-lint-markers"],
          spellcheck: true,
          autoRefresh: true,
          indentWithTabs: false
        });

        this._configEditorYAML.on('changes', function (cm, changes) {
          onChangeConfigYAML(cm.getValue());
        });
      }
    }
  }, {
    key: "initEditor",
    value: function initEditor() {
      var templateCode = getTemplateCode();
      var cssCode = getCssCode();

      if (getConfigContentMode() == CONFIG_CONTENT_MODE_JSON) {
        this._configEditorJSON.setValue(_configJsonStr);

        $('.main-config-json-container').show();
        $('.main-config-yaml-container').hide();
      } else {
        this._configEditorYAML.setValue(_configYamlStr);

        $('.main-config-json-container').hide();
        $('.main-config-yaml-container').show();
      }

      if (USE_ACE) {
        this._configEditorJSON.clearSelection();

        this._configEditorYAML.clearSelection();
      } else if (USE_CODEMIRROR) {
        //setTimeout(function () {
        this._configEditorJSON.refresh();

        this._configEditorYAML.refresh(); //}, 100);

      }
    }
  }, {
    key: "lockConfig",
    value: function lockConfig() {
      _lockConfigCode = true;
      localStorage.setItem(STORAGE_KEY_LOCK_CONFIG_CODE, _lockConfigCode);
      $('#chbLockConfigHelp').html(site.data.strings.editor.config.lock_config_help);
    }
  }, {
    key: "unlockConfig",
    value: function unlockConfig() {
      _lockConfigCode = false;
      localStorage.setItem(STORAGE_KEY_LOCK_CONFIG_CODE, _lockConfigCode);
      $('#chbLockConfigHelp').html(site.data.strings.editor.config.unlock_config_help);
    }
  }]);

  return ConfigEditor;
}();

exports.ConfigEditor = ConfigEditor;