import { site, USE_CODEMIRROR, USE_ACE } from './site'
declare var jsonlint: any
import * as ace from 'ace-builds'
import * as CodeMirror from 'codemirror'
import * as jsyaml from 'js-yaml'
import { ApplicationData, CONFIG_CONTENT_MODE_JSON, CONFIG_CONTENT_MODE_YAML } from './application.data'
import { SavedConfigs } from './configs'
import { ApplicationListener } from './application.listener'

export class ConfigEditor {
    private _configEditorJSON: any = null;
    private _configEditorYAML: any = null;
    private _appData: ApplicationData;
    private _configs: SavedConfigs;
    private _appListener: ApplicationListener;

    constructor(appData: ApplicationData, configs: SavedConfigs, appListener: ApplicationListener) {
        this._appData = appData;
        this._configs = configs;
        this._appListener = appListener;
    }
    
    set configError(error: string) {
        $('#configError').html(error).show();
        this._configs.updateSaveConfigControls();
    }
    clearConfigError() {
        $('#configError').hide().empty();
        this._configs.updateSaveConfigControls();
    }

    generateConfigEditor() {
        var that = this;
        if (USE_ACE) {
            $('#txtConfigJSON').replaceWith('<pre id="txtConfigJSON" class="pre-ace-editor"></pre>');
            this._configEditorJSON = ace.edit("txtConfigJSON");
            //this._configEditorJSON.setTheme("ace/theme/dracula");
            this._configEditorJSON.session.setMode("ace/mode/json");
            this._configEditorJSON.session.on('change', function (delta: any) {
                // delta.start, delta.end, delta.lines, delta.action
                that.onChangeConfigJSON(that._configEditorJSON.getValue());
            });

            $('#txtConfigYAML').replaceWith('<pre id="txtConfigYAML" class="pre-ace-editor"></pre>');
            this._configEditorYAML = ace.edit("txtConfigYAML");
            //this._configEditorYAML.setTheme("ace/theme/dracula");
            this._configEditorYAML.session.setMode("ace/mode/yaml");
            this._configEditorYAML.session.on('change', function (delta: any) {
                // delta.start, delta.end, delta.lines, delta.action
                that.onChangeConfigYAML(that._configEditorYAML.getValue());
            });
        } else if (USE_CODEMIRROR) {
            this._configEditorJSON = CodeMirror.fromTextArea(document.getElementById('txtConfigJSON') as HTMLTextAreaElement, {
                value: this._appData.configJsonStr || this._appData.configCodeJSON,
                mode: CONFIG_CONTENT_MODE_JSON,
                //theme: 'dracula',
                lineNumbers: true,
                lint: true,
                gutters: ["CodeMirror-lint-markers"],
                spellcheck: true
            });
            this._configEditorJSON.on('changes', function (cm: any, changes: any) {
                that.onChangeConfigJSON(cm.getValue());
            });

            this._configEditorYAML = CodeMirror.fromTextArea(document.getElementById('txtConfigYAML') as HTMLTextAreaElement, {
                value: this._appData.configYamlStr || this._appData.configCodeYAML,
                mode: CONFIG_CONTENT_MODE_YAML,
                //theme: 'dracula',
                lineNumbers: true,
                lint: true,
                gutters: ["CodeMirror-lint-markers"],
                spellcheck: true,
                indentWithTabs: false
            });
            this._configEditorYAML.on('changes', function (cm: any, changes: any) {
                that.onChangeConfigYAML(cm.getValue());
            });
        }
    }
    
    
    initEditor() {
        if (this._appData.configContentMode == CONFIG_CONTENT_MODE_JSON) {
            this._configEditorJSON.setValue(this._appData.configJsonStr);

            $('.main-config-json-container').show();
            $('.main-config-yaml-container').hide();
        } else {
            this._configEditorYAML.setValue(this._appData.configYamlStr);

            $('.main-config-json-container').hide();
            $('.main-config-yaml-container').show();
        }

        if (USE_ACE) {
            this._configEditorJSON.clearSelection();
            this._configEditorYAML.clearSelection();
        } else if (USE_CODEMIRROR) {
            //setTimeout(function () {
            this._configEditorJSON.refresh();
            this._configEditorYAML.refresh();
            //}, 100);
        }
    }
    
    lockConfig() {
        this._appData.lockConfig();
        $('#chbLockConfigHelp').html(site.data.strings.editor.config.lock_config_help);
    }
    unlockConfig() {
        this._appData.unlockConfig();
        $('#chbLockConfigHelp').html(site.data.strings.editor.config.unlock_config_help);
    }

    
    
    private onChangeConfigJSON (value: string) {
        this._appData.configJsonStr = value;
        try {
            if (this._appData.configJsonStr !== '') {
                let config = jsonlint.parse(this._appData.configJsonStr);
                this._appData.configJson = config;
                if (this._appData.isLivePreviewEnabled) {
                    this._appListener.generateHTML();
                }
            }
        } catch (error) {
            this.configError = error.toString();
        }
    }

    private onChangeConfigYAML (value: string) {
        this._appData.configYamlStr = value;
        try {
            if (this._appData.configYamlStr !== '') {
                let config = jsyaml.load(this._appData.configYamlStr);
                this._appData.configJson = config;
                if (this._appData.isLivePreviewEnabled) {
                    this._appListener.generateHTML();
                }
            }
        } catch (error) {
            this.configError = error.toString();
        }
    }
}