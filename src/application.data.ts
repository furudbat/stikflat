import * as jsyaml from 'js-yaml'

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

export class ApplicationData {

    private _templateCode: string = '';
    private _configJson: any = {};
    private _configJsonStr: string = '';
    private _configYamlStr: string = '';
    private _cssCode: string = '';
    private _lockConfigCode: boolean = false;
    private _enableWYSIWYGTemplateEditor: boolean = false;
    private _enableLivePreview: boolean = true;
    private _configContentMode = CONFIG_CONTENT_MODE_JSON;

    private _currentConfigIndex: number | null = null;
    private _savedConfigs: Array<any> = [];

    constructor() {
    }

    loadFromStorage() {
        if (STORAGE_AVAILABLE === true) {
            this._templateCode = localStorage.getItem(STORAGE_KEY_TEMPLATE_CODE) || this._templateCode;

            try {
                this._configJson = $.parseJSON(localStorage.getItem(STORAGE_KEY_CONFIG_CODE) || '{}') || this._configJson;
            } catch (e) {
                console.error({ loadFromStorage: 'parse CONFIG_CODE', e });
                this._configJson = {};
            }
            this._configJsonStr = localStorage.getItem(STORAGE_KEY_CONFIG_CODE_JSON) || this.configCodeJSON;
            this._configYamlStr = localStorage.getItem(STORAGE_KEY_CONFIG_CODE_YAML) || this.configCodeYAML;

            this._cssCode = localStorage.getItem(STORAGE_KEY_CSS_CODE) || this._cssCode;
            this._lockConfigCode = localStorage.getItem(STORAGE_KEY_LOCK_CONFIG_CODE) === 'true' || this._lockConfigCode;
            this._enableWYSIWYGTemplateEditor = localStorage.getItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR) === 'true' || this._enableWYSIWYGTemplateEditor;
            this._enableLivePreview = localStorage.getItem(STORAGE_KEY_ENABLE_LIVE_PREVIEW) === 'true' || this._enableLivePreview;
            this._configContentMode = localStorage.getItem(STORAGE_KEY_CONFIG_CONTENT_MODE) || this._configContentMode;

            try {
                this._currentConfigIndex = parseInt(localStorage.getItem(STORAGE_KEY_CURRENT_CONFIG_INDEX) || '0') || this._currentConfigIndex;
            } catch (e) {
                console.error({ loadFromStorage: 'parse CURRENT_CONFIG_INDEX', e });
                this._currentConfigIndex = null;
            }
            try {
                this._savedConfigs = $.parseJSON(localStorage.getItem(STORAGE_KEY_SAVED_CONFIGS) || '[]') || this._savedConfigs;
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
            console.error('no local storage available');
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

    get templateCode() {
        return this._templateCode;
    }
    get configJson() {
        return this._configJson;
    }
    get configCodeJSON() {
        return JSON.stringify(this._configJson, null, 4);
    }
    get configCodeYAML() {
        return jsyaml.dump(this._configJson, { indent: 4, lineWidth: 80 });
    }
    get configContentMode() {
        return this._configContentMode;
    }
    get cssCode() {
        return this._cssCode;
    }

    set templateCode(code) {
        this._templateCode = code;
        localStorage.setItem(STORAGE_KEY_TEMPLATE_CODE, code);
    }
    set configJson(json) {
        if (json !== null) {
            this._configJson = json;
            localStorage.setItem(STORAGE_KEY_CONFIG_CODE, JSON.stringify(json));
        }
    }
    set cssCode(code) {
        this._cssCode = code;
        localStorage.setItem(STORAGE_KEY_CSS_CODE, code);
    }
    set codeContentMode(mode) {
        this._configContentMode = mode;
        localStorage.setItem(STORAGE_KEY_CONFIG_CONTENT_MODE, mode);
    }
    get codeContentMode() {
        return this._configContentMode;
    }


    get savedConfigs() {
        return this._savedConfigs;
    }
    get currentSavedConfigJson() {
        return (this._currentConfigIndex !== null && this._currentConfigIndex < this._savedConfigs.length) ? this._savedConfigs[this._currentConfigIndex] : null;
    }

    get isLivePreviewEnabled(): boolean {
        return this._enableLivePreview === true;
    }
    get isLivePreviewDisabled(): boolean {
        return this._enableLivePreview === false;
    }

    enableLivePreview() {
        this._enableLivePreview = true;
        localStorage.setItem(STORAGE_KEY_ENABLE_LIVE_PREVIEW, this._enableLivePreview.toString());
    }
    disableLivePreview() {
        this._enableLivePreview = false;
        localStorage.setItem(STORAGE_KEY_ENABLE_LIVE_PREVIEW, this._enableLivePreview.toString());
    }

    saveConfigs() {
        localStorage.setItem(STORAGE_KEY_CURRENT_CONFIG_INDEX, (this._currentConfigIndex === null) ? '' : this._currentConfigIndex.toString());
        localStorage.setItem(STORAGE_KEY_SAVED_CONFIGS, JSON.stringify(this._savedConfigs));
    }
    addConfig(json: any, jsonstr: string, yamlstr: string) {
        if (json !== null) {
            this._savedConfigs.push({ json, jsonstr, yamlstr });
            this._currentConfigIndex = this._savedConfigs.length - 1;
            this.saveConfigs();
        }
    }
    saveConfig(index: number, json: any, jsonstr: string, yamlstr: string) {
        if (index < this._savedConfigs.length) {
            this._savedConfigs[index] = { json, jsonstr, yamlstr };
            this.saveConfigs();
        }
    }
    addCurrentConfig() {
        this.addConfig(this.configJson, this.configJsonStr, this.configYamlStr);
    }

    updateConfigCodesStr() {
        this.configJsonStr = this.configCodeJSON;
        this.configYamlStr = this.configCodeYAML;
    }

    set configJsonStr(jsonstr: string) {
        this._configJsonStr = jsonstr;
        localStorage.setItem(STORAGE_KEY_CONFIG_CODE_JSON, this._configJsonStr);
    }
    set configYamlStr(yamlstr: string) {
        this._configYamlStr = yamlstr;
        localStorage.setItem(STORAGE_KEY_CONFIG_CODE_YAML, this._configYamlStr);
    }

    get configJsonStr() {
        return this._configJsonStr;
    }
    get configYamlStr() {
        return this._configYamlStr;
    }

    lockConfig() {
        this._lockConfigCode = true;
        localStorage.setItem(STORAGE_KEY_LOCK_CONFIG_CODE, this._lockConfigCode.toString());
    }
    unlockConfig() {
        this._lockConfigCode = false;
        localStorage.setItem(STORAGE_KEY_LOCK_CONFIG_CODE, this._lockConfigCode.toString());
    }

    get isLockConfig() {
        return this._lockConfigCode;
    }

    enableWYSIWYGEditor() {
        this._enableWYSIWYGTemplateEditor = true;
        localStorage.setItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR, this._enableWYSIWYGTemplateEditor.toString());
    }
    disableWYSIWYGEditor() {
        this._enableWYSIWYGTemplateEditor = false;
        localStorage.setItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR, this._enableWYSIWYGTemplateEditor.toString());
    }

    get isWYSIWYGEditorEnabled() {
        return this._enableWYSIWYGTemplateEditor;
    }

    get currentConfigIndex() {
        return this._currentConfigIndex;
    }
    
    set currentConfigIndex(index: number | null) {
        this._currentConfigIndex = index;
    }
}