import { site } from './site'
import parseJson from 'json-parse-better-errors';
import ace from 'brace';
import 'brace/ext/beautify'
import 'brace/ext/textarea'
import 'brace/ext/error_marker'
import 'brace/ext/spellcheck'
import 'brace/mode/json';
import 'brace/mode/yaml';
import 'brace/worker/json'
import 'brace/theme/dracula';
import * as jsyaml from 'js-yaml';
import { ApplicationData, CONFIG_CONTENT_MODE_JSON, CONFIG_CONTENT_MODE_YAML } from './application.data';
import { SavedConfigs } from './configs';
import { ApplicationListener } from './application.listener';

export class ConfigEditor {
    private _configEditorJSON: ace.Editor | null = null;
    private _configEditorYAML: ace.Editor | null = null;
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

        $('#txtConfigJSON').replaceWith('<pre id="txtConfigJSON" class="pre-ace-editor"></pre>');
        this._configEditorJSON = ace.edit('txtConfigJSON');
        this._configEditorJSON.$blockScrolling = Infinity;
        this._configEditorJSON.setTheme('ace/theme/dracula');
        this._configEditorJSON.session.setMode('ace/mode/json');
        this._configEditorJSON.session.on('change', function (delta) {
            // delta.start, delta.end, delta.lines, delta.action
            that.onChangeConfigJSON((that._configEditorJSON)? that._configEditorJSON.getValue() : '');
        });

        $('#txtConfigYAML').replaceWith('<pre id="txtConfigYAML" class="pre-ace-editor"></pre>');
        this._configEditorYAML = ace.edit('txtConfigYAML');
        this._configEditorYAML.$blockScrolling = Infinity;
        this._configEditorYAML.setTheme('ace/theme/dracula');
        this._configEditorYAML.session.setMode('ace/mode/yaml');
        this._configEditorYAML.session.on('change', function (delta) {
            // delta.start, delta.end, delta.lines, delta.action
            that.onChangeConfigYAML((that._configEditorYAML)? that._configEditorYAML.getValue() : '');
        });
    }
    
    
    initEditor() {
        if (this._configEditorJSON && this._appData.configContentMode == CONFIG_CONTENT_MODE_JSON) {
            this._configEditorJSON.setValue(this._appData.configJsonStr);
            this._configEditorJSON.clearSelection();

            $('.main-config-json-container').show();
            $('.main-config-yaml-container').hide();

        } else if(this._configEditorYAML) {
            this._configEditorYAML.setValue(this._appData.configYamlStr);
            this._configEditorYAML.clearSelection();

            $('.main-config-json-container').hide();
            $('.main-config-yaml-container').show();
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
                const config = parseJson(this._appData.configJsonStr);
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
                const config = jsyaml.load(this._appData.configYamlStr);
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