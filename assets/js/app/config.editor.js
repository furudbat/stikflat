/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, FroalaEditor, ace, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify, tinymce, jsonlint, jsyaml */
/*global site, countlines, USE_FROLALA_EDITOR, USE_ACE, USE_CODEMIRROR */
'use strict';

export class ConfigEditor {
    constructor(app) {
        this.app = app;
        this._configEditorJSON = null;
        this._configEditorYAML = null;
    }
    
    setConfigError(error) {
        $('#configError').html(error).show();
        updateSaveConfigControls();
    }
    clearConfigError() {
        $('#configError').hide().empty();
        updateSaveConfigControls();
    }

    generateConfigEditor() {
        var that = this;
        var onChangeConfigJSON = function (value) {
            _configJsonStr = value;
            localStorage.setItem(STORAGE_KEY_CONFIG_CODE_JSON, _configJsonStr);
            try {
                if (_configJsonStr !== '') {
                    let config = jsonlint.parse(_configJsonStr);
                    setConfigJson(config);
                    if (_enableLivePreview === true) {
                        generateHTML();
                    }
                }
            } catch (error) {
                that.setConfigError(error.toString());
            }
        };
        var onChangeConfigYAML = function (value) {
            _configYamlStr = value;
            localStorage.setItem(STORAGE_KEY_CONFIG_CODE_YAML, _configYamlStr);
            try {
                if (_configYamlStr !== '') {
                    let config = jsyaml.load(_configYamlStr);
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
            this._configEditorJSON = ace.edit("txtConfigJSON");
            //this._configEditorJSON.setTheme("ace/theme/dracula");
            this._configEditorJSON.session.setMode("ace/mode/json");
            this._configEditorJSON.session.on('change', function (delta) {
                // delta.start, delta.end, delta.lines, delta.action
                onChangeConfigJSON(that._configEditorJSON.getValue());
            });

            $('#txtConfigYAML').replaceWith('<pre id="txtConfigYAML" class="pre-ace-editor"></pre>');
            this._configEditorYAML = ace.edit("txtConfigYAML");
            //this._configEditorYAML.setTheme("ace/theme/dracula");
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
    
    
    initEditor() {
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
            this._configEditorYAML.refresh();
            //}, 100);
        }
    }
    
    lockConfig() {
        _lockConfigCode = true;
        localStorage.setItem(STORAGE_KEY_LOCK_CONFIG_CODE, _lockConfigCode);
        $('#chbLockConfigHelp').html(site.data.strings.editor.config.lock_config_help);
    }
    unlockConfig() {
        _lockConfigCode = false;
        localStorage.setItem(STORAGE_KEY_LOCK_CONFIG_CODE, _lockConfigCode);
        $('#chbLockConfigHelp').html(site.data.strings.editor.config.unlock_config_help);
    }

}