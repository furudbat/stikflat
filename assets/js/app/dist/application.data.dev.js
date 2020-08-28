/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify, jsyaml */

/*global site */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CONFIG_CONTENT_MODE_YAML = exports.CONFIG_CONTENT_MODE_JSON = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var STORAGE_AVAILABLE = typeof Storage !== 'undefined';
var STORAGE_KEY_TEMPLATE_CODE = 'template_code';
var STORAGE_KEY_CONFIG_CODE = 'config_code';
var STORAGE_KEY_CONFIG_CODE_JSON = 'config_code_json';
var STORAGE_KEY_CONFIG_CODE_YAML = 'config_code_yaml';
var STORAGE_KEY_CSS_CODE = 'css_code';
var STORAGE_KEY_LOCK_CONFIG_CODE = 'lock_config_code';
var STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR = 'enable_WYSIWYG_template_editor';
var STORAGE_KEY_ENABLE_LIVE_PREVIEW = 'enable_live_preview';
var STORAGE_KEY_CURRENT_CONFIG_INDEX = 'current_config_index';
var STORAGE_KEY_SAVED_CONFIGS = 'saved_configs';
var STORAGE_KEY_CONFIG_CONTENT_MODE = 'config_content_mode';
var CONFIG_CONTENT_MODE_JSON = 'application/json';
exports.CONFIG_CONTENT_MODE_JSON = CONFIG_CONTENT_MODE_JSON;
var CONFIG_CONTENT_MODE_YAML = 'text/x-yaml';
exports.CONFIG_CONTENT_MODE_YAML = CONFIG_CONTENT_MODE_YAML;

var ApplicationData =
/*#__PURE__*/
function () {
  function ApplicationData() {
    _classCallCheck(this, ApplicationData);

    this._templateCode = '';
    this._configJson = {};
    this._configJsonStr = '';
    this._configYamlStr = '';
    this._cssCode = '';
    this._codePreview = '';
    this._currentLayoutId = '';
    this._lockConfigCode = false;
    this._enableWYSIWYGTemplateEditor = false;
    this._enableLivePreview = true;
    this._currentTemplateEditorName = '';
    this._configContentMode = CONFIG_CONTENT_MODE_JSON;
    this._currentConfigIndex = null;
    this._savedConfigs = [];
  }

  _createClass(ApplicationData, [{
    key: "loadFromStorage",
    value: function loadFromStorage() {
      if (STORAGE_AVAILABLE === true) {
        this._templateCode = localStorage.getItem(STORAGE_KEY_TEMPLATE_CODE) || this._templateCode;

        try {
          this._configJson = $.parseJSON(localStorage.getItem(STORAGE_KEY_CONFIG_CODE)) || this._configJson;
        } catch (e) {
          console.error({
            loadFromStorage: 'parse CONFIG_CODE',
            e: e
          });
          this._configJson = {};
        }

        this._configJsonStr = localStorage.getItem(STORAGE_KEY_CONFIG_CODE_JSON) || this.getConfigCodeJSON();
        this._configYamlStr = localStorage.getItem(STORAGE_KEY_CONFIG_CODE_YAML) || this.getConfigCodeYAML();
        this._cssCode = localStorage.getItem(STORAGE_KEY_CSS_CODE) || this._cssCode;
        this._lockConfigCode = localStorage.getItem(STORAGE_KEY_LOCK_CONFIG_CODE) === 'true' || this._lockConfigCode;
        this._enableWYSIWYGTemplateEditor = localStorage.getItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR) === 'true' || this._enableWYSIWYGTemplateEditor;
        this._enableLivePreview = localStorage.getItem(STORAGE_KEY_ENABLE_LIVE_PREVIEW) === 'true' || this._enableLivePreview;
        this._configContentMode = localStorage.getItem(STORAGE_KEY_CONFIG_CONTENT_MODE) || this._configContentMode;

        try {
          this._currentConfigIndex = parseInt(localStorage.getItem(STORAGE_KEY_CURRENT_CONFIG_INDEX)) || this._currentConfigIndex;
        } catch (e) {
          console.error({
            loadFromStorage: 'parse CURRENT_CONFIG_INDEX',
            e: e
          });
          this._currentConfigIndex = null;
        }

        try {
          this._savedConfigs = $.parseJSON(localStorage.getItem(STORAGE_KEY_SAVED_CONFIGS)) || this._savedConfigs;

          if (!$.isArray(this._savedConfigs)) {
            console.error({
              loadFromStorage: 'parse SAVED_CONFIGS',
              message: 'not an array'
            });
            this._savedConfigs = [];
          }
        } catch (e) {
          console.error({
            loadFromStorage: 'parse SAVED_CONFIGS',
            e: e
          });
          this._savedConfigs = [];
        } //console.debug('loadFromStorage', { _templateCode, _configJson, _cssCode, _lockConfigCode, _enableWYSIWYGTemplateEditor, _enableLivePreview, _currentConfigIndex, _savedConfigs });

      } else {
        console.log('no local storage available');
      }
    }
  }, {
    key: "clearTemplateStorage",
    value: function clearTemplateStorage() {
      if (STORAGE_AVAILABLE === true) {
        localStorage.removeItem(STORAGE_KEY_TEMPLATE_CODE);
        localStorage.removeItem(STORAGE_KEY_CONFIG_CODE);
        localStorage.removeItem(STORAGE_KEY_CONFIG_CODE_JSON);
        localStorage.removeItem(STORAGE_KEY_CONFIG_CODE_YAML);
        localStorage.removeItem(STORAGE_KEY_CSS_CODE);
        localStorage.removeItem(STORAGE_KEY_LOCK_CONFIG_CODE);
        localStorage.removeItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR);
        localStorage.removeItem(STORAGE_KEY_ENABLE_LIVE_PREVIEW);
        localStorage.removeItem(STORAGE_KEY_CONFIG_CONTENT_MODE);
      }
    }
  }, {
    key: "clearSavedConfigsStorage",
    value: function clearSavedConfigsStorage() {
      if (STORAGE_AVAILABLE === true) {
        localStorage.removeItem(STORAGE_KEY_CURRENT_CONFIG_INDEX);
        localStorage.removeItem(STORAGE_KEY_SAVED_CONFIGS);
      }
    }
  }, {
    key: "getTemplateCode",
    value: function getTemplateCode() {
      return this._templateCode;
    }
  }, {
    key: "getConfigJson",
    value: function getConfigJson() {
      return this._configJson;
    }
  }, {
    key: "getConfigCodeJSON",
    value: function getConfigCodeJSON() {
      return JSON.stringify(this._configJson, null, 4);
    }
  }, {
    key: "getConfigCodeYAML",
    value: function getConfigCodeYAML() {
      return jsyaml.dump(this._configJson, {
        indent: 4,
        lineWidth: 80
      });
    }
  }, {
    key: "getConfigContentMode",
    value: function getConfigContentMode() {
      return this._configContentMode;
    }
  }, {
    key: "getCssCode",
    value: function getCssCode() {
      return this._cssCode;
    }
  }, {
    key: "setTemplateCode",
    value: function setTemplateCode(code) {
      this._templateCode = code;
      localStorage.setItem(STORAGE_KEY_TEMPLATE_CODE, code);
    }
  }, {
    key: "setConfigJson",
    value: function setConfigJson(json) {
      if (json !== null) {
        this._configJson = json;
        localStorage.setItem(STORAGE_KEY_CONFIG_CODE, JSON.stringify(json));
      }
    }
  }, {
    key: "setCssCode",
    value: function setCssCode(code) {
      this._cssCode = code;
      localStorage.setItem(STORAGE_KEY_CSS_CODE, code);
    }
  }, {
    key: "setCodeContentMode",
    value: function setCodeContentMode(mode) {
      this._configContentMode = mode;
      localStorage.setItem(STORAGE_KEY_CONFIG_CONTENT_MODE, mode);
    }
  }, {
    key: "updateConfigCodesStr",
    value: function updateConfigCodesStr() {
      this._configJsonStr = this.getConfigCodeJSON();
      this._configYamlStr = this.getConfigCodeYAML();
    }
  }, {
    key: "getSavedConfigsArray",
    value: function getSavedConfigsArray() {
      return this._savedConfigs;
    }
  }, {
    key: "getCurrentSavedConfigJson",
    value: function getCurrentSavedConfigJson() {
      return this._currentConfigIndex !== null && this._currentConfigIndex < this._savedConfigs.length ? this._savedConfigs[this._currentConfigIndex] : null;
    }
  }, {
    key: "saveConfigs",
    value: function saveConfigs() {
      localStorage.setItem(STORAGE_KEY_CURRENT_CONFIG_INDEX, this._currentConfigIndex);
      localStorage.setItem(STORAGE_KEY_SAVED_CONFIGS, JSON.stringify(this._savedConfigs));
    }
  }, {
    key: "addConfig",
    value: function addConfig(json, jsonstr, yamlstr) {
      if (json !== null) {
        this._savedConfigs.push({
          json: json,
          jsonstr: jsonstr,
          yamlstr: yamlstr
        });

        this._currentConfigIndex = this._savedConfigs.length - 1;
        this.saveConfigs();
      }
    }
  }, {
    key: "saveConfig",
    value: function saveConfig(index, json, jsonstr, yamlstr) {
      if (index < this._savedConfigs.length) {
        this._savedConfigs[index] = {
          json: json,
          jsonstr: jsonstr,
          yamlstr: yamlstr
        };
        this.saveConfigs();
      }
    }
  }]);

  return ApplicationData;
}();