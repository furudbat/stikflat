/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify, jsyaml */
/*global site */
'use strict';

const STORAGE_AVAILABLE = typeof (Storage) !== 'undefined';
const STORAGE_KEY_TEMPLATE_CODE = 'template_code';
const STORAGE_KEY_CONFIG_CODE = 'config_code';
const STORAGE_KEY_CONFIG_CODE_JSON = 'config_code_json';
const STORAGE_KEY_CONFIG_CODE_YAML = 'config_code_yaml';
const STORAGE_KEY_CSS_CODE = 'css_code';
const STORAGE_KEY_LOCK_CONFIG_CODE = 'lock_config_code';
const STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR = 'enable_WYSIWYG_template_editor';
const STORAGE_KEY_ENABLE_LIVE_PREVIEW = 'enable_live_preview';
const STORAGE_KEY_CURRENT_CONFIG_INDEX = 'current_config_index';
const STORAGE_KEY_SAVED_CONFIGS = 'saved_configs';
const STORAGE_KEY_CONFIG_CONTENT_MODE = 'config_content_mode';

export const CONFIG_CONTENT_MODE_JSON = 'application/json';
export const CONFIG_CONTENT_MODE_YAML = 'text/x-yaml';

class ApplicationData {
    
    constructor() {
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

    loadFromStorage() {
        if (STORAGE_AVAILABLE === true) {
            this._templateCode = localStorage.getItem(STORAGE_KEY_TEMPLATE_CODE) || this._templateCode;

            try {
                this._configJson = $.parseJSON(localStorage.getItem(STORAGE_KEY_CONFIG_CODE)) || this._configJson;
            } catch (e) {
                console.error({ loadFromStorage: 'parse CONFIG_CODE', e });
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
                console.error({ loadFromStorage: 'parse CURRENT_CONFIG_INDEX', e });
                this._currentConfigIndex = null;
            }
            try {
                this._savedConfigs = $.parseJSON(localStorage.getItem(STORAGE_KEY_SAVED_CONFIGS)) || this._savedConfigs;
                if (!$.isArray(this._savedConfigs)) {
                    console.error({ loadFromStorage: 'parse SAVED_CONFIGS', message: 'not an array' });
                    this._savedConfigs = [];
                }
            } catch (e) {
                console.error({ loadFromStorage: 'parse SAVED_CONFIGS', e });
                this._savedConfigs = [];
            }

            //console.debug('loadFromStorage', { _templateCode, _configJson, _cssCode, _lockConfigCode, _enableWYSIWYGTemplateEditor, _enableLivePreview, _currentConfigIndex, _savedConfigs });
        } else {
            console.log('no local storage available');
        }
    }

    clearTemplateStorage() {
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
    clearSavedConfigsStorage() {
        if (STORAGE_AVAILABLE === true) {
            localStorage.removeItem(STORAGE_KEY_CURRENT_CONFIG_INDEX);
            localStorage.removeItem(STORAGE_KEY_SAVED_CONFIGS);
        }
    }

    getTemplateCode() {
        return this._templateCode;
    }
    getConfigJson() {
        return this._configJson;
    }
    getConfigCodeJSON() {
        return JSON.stringify(this._configJson, null, 4);
    }
    getConfigCodeYAML() {
        return jsyaml.dump(this._configJson, { indent: 4, lineWidth: 80 });
    }
    getConfigContentMode() {
        return this._configContentMode;
    }
    getCssCode() {
        return this._cssCode;
    }

    setTemplateCode(code) {
        this._templateCode = code;
        localStorage.setItem(STORAGE_KEY_TEMPLATE_CODE, code);
    }
    setConfigJson(json) {
        if (json !== null) {
            this._configJson = json;
            localStorage.setItem(STORAGE_KEY_CONFIG_CODE, JSON.stringify(json));
        }
    }
    setCssCode(code) {
        this._cssCode = code;
        localStorage.setItem(STORAGE_KEY_CSS_CODE, code);
    }
    setCodeContentMode(mode) {
        this._configContentMode = mode;
        localStorage.setItem(STORAGE_KEY_CONFIG_CONTENT_MODE, mode);
    }
    updateConfigCodesStr() {
        this._configJsonStr = this.getConfigCodeJSON();
        this._configYamlStr = this.getConfigCodeYAML();
    }


    getSavedConfigsArray() {
        return this._savedConfigs;
    }
    getCurrentSavedConfigJson() {
        return (this._currentConfigIndex !== null && this._currentConfigIndex < this._savedConfigs.length) ? this._savedConfigs[this._currentConfigIndex] : null;
    }
    saveConfigs() {
        localStorage.setItem(STORAGE_KEY_CURRENT_CONFIG_INDEX, this._currentConfigIndex);
        localStorage.setItem(STORAGE_KEY_SAVED_CONFIGS, JSON.stringify(this._savedConfigs));
    }
    addConfig(json, jsonstr, yamlstr) {
        if (json !== null) {
            this._savedConfigs.push({ json, jsonstr, yamlstr });
            this._currentConfigIndex = this._savedConfigs.length - 1;
            this.saveConfigs();
        }
    }
    saveConfig(index, json, jsonstr, yamlstr) {
        if (index < this._savedConfigs.length) {
            this._savedConfigs[index] = { json, jsonstr, yamlstr };
            this.saveConfigs();
        }
    }

}