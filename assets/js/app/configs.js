/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify, jsyaml */
/*global site, makeDoubleClick */
'use strict';

const SAVED_CONFIG_SELECTED_BUTTON_CLASS = 'btn-primary';
const SAVED_CONFIG_NOT_SELECTED_BUTTON_CLASS = 'btn-outline-secondary';
const SAVED_CONFIG_BUTTON_CLASS = 'saved-content-content';

export class SavedConfigs {

    constructor() {
        var that = this;
        this.overrideConfig = function (configButton) {
            let index = $(configButton).data('index');
            if (index === null || index === '') {
                console.error('overrideConfig', 'index is empty');
                return;
            }

            //console.debug('overrideConfig', {index, configButton});

            _currentConfigIndex = parseInt(index);

            let savedConfig = getCurrentSavedConfigJson();
            if (savedConfig !== null) {
                setConfigJson(savedConfig.json);
                _configJsonStr = savedConfig.jsonstr;
                _configYamlStr = savedConfig.yamlstr;

                initEditors();
                generateHTML();
            } else {
                _currentConfigIndex = null;
            }

            that.updateSaveConfigControls();
            that.updateSavedConfigsSelection(_currentConfigIndex);
        };

        this.previewWithConfig = function (configButton) {
            let index = $(configButton).data('index');
            if (index === null || index === '') {
                console.error('previewWithConfig', 'index is empty');
                return;
            }

            //console.debug('previewWithConfig', {index, configButton});

            _currentConfigIndex = parseInt(index);

            let savedConfig = getCurrentSavedConfigJson();
            if (savedConfig !== null) {
                let template = getTemplateCode();
                let css = getCssCode();

                generateHTMLFromTemplate(template, savedConfig.json, css, true);
                selectPreviewTab();
            }
        };

    }
    
    generateButtonFromConfig(config, index = '') {
        let cssclass = 'mr-1 mt-1 mb-2 btn ' + SAVED_CONFIG_BUTTON_CLASS + ' ' + SAVED_CONFIG_NOT_SELECTED_BUTTON_CLASS;
        let name = site.data.strings.content.content_default_prefix + ((index !== '') ? ' ' + (index + 1) : '');
        if (config) {
            if ('title' in config && config.title !== '') {
                name = config.title;
            } else if ('name' in config && config.name !== '') {
                name = config.name;
            }
        }

        return $('<button type="button" class="' + cssclass + '" data-index="' + index + '">' + name + '</button>');
    }
    
    addSavedConfigToList(config, index) {
        if (config === null || index === null) {
            console.error('addSavedConfigToList', 'config or index are null', { config, index });
            return;
        }
        let configButton = this.generateButtonFromConfig(config, index);
        $('.saved-content-list').append(configButton);
        makeDoubleClick($('.' + SAVED_CONFIG_BUTTON_CLASS + "[data-index='" + index + "']"), this.overrideConfig, this.previewWithConfig);

        //console.debug('addSavedConfigToList', index, config, configButton, $('.saved-content-list').find('.' + SAVED_CONFIG_BUTTON_CLASS).last());

        this.updateSaveConfigControls();
    }
    generateSavedConfigsFromList() {
        if (_savedConfigs.length > 0) {
            $('.saved-content-list').empty();
            for (let i = 0; i < _savedConfigs.length; i++) {
                let config = _savedConfigs[i].json;
                //console.debug(i, config);
                this.addSavedConfigToList(config, i);
            }
            $('.saved-content-container').show();
        } else {
            $('.saved-content-list').empty();
            $('.saved-content-container').hide();
        }

        this.updateSavedConfigsSelection(_currentConfigIndex);
    }
    updateSaveConfigControls() {
        if (_currentConfigIndex !== null && _currentConfigIndex < _savedConfigs.length) {
            $('#btnSaveConfig').show();
        } else {
            $('#btnSaveConfig').hide();
        }
        if ($('#configError').is(":visible")) {
            $('.main-config-controls').each(function () {
                $(this).prop('disabled', true);
            });
        } else {
            $('.main-config-controls').each(function () {
                $(this).prop('disabled', false);
            });
        }
    }
    updateSavedConfigsSelection(index) {
        if (_savedConfigs.length > 0) {
            $('.saved-content-container').show();
        } else {
            $('.saved-content-container').hide();
        }

        $('.' + SAVED_CONFIG_BUTTON_CLASS).each(function (i) {
            $(this).removeClass(SAVED_CONFIG_SELECTED_BUTTON_CLASS).removeClass(SAVED_CONFIG_NOT_SELECTED_BUTTON_CLASS);
            if ($(this).data('index') == index) {
                $(this).addClass(SAVED_CONFIG_SELECTED_BUTTON_CLASS);
            } else {
                $(this).addClass(SAVED_CONFIG_NOT_SELECTED_BUTTON_CLASS);
            }
        });
    }

    initSaveConfigControls() {
        var savedConfigs = $('.' + SAVED_CONFIG_BUTTON_CLASS);

        var that = this;
        if (savedConfigs && savedConfigs.length) {
            savedConfigs.each(function () {
                makeDoubleClick($(this), that.overrideConfig, that.previewWithConfig);
            });
        }
        $('#btnAddConfig').click(function () {
            addConfig(getConfigJson(), that._configJsonStr, that._configYamlStr);
            //console.debug('btnAddConfig', {_currentConfigIndex});

            let savedConfig = getCurrentSavedConfigJson();
            if (savedConfig !== null) {
                that.addSavedConfigToList(savedConfig.json, _currentConfigIndex);
            }
            that.updateSavedConfigsSelection(_currentConfigIndex);
        });

        $('#btnSaveConfig').click(function () {
            saveConfig(_currentConfigIndex, getConfigJson(), _configJsonStr, _configYamlStr);

            let savedConfig = getCurrentSavedConfigJson();
            if (savedConfig !== null) {
                let savedConfigBtn = $('.' + SAVED_CONFIG_BUTTON_CLASS + "[data-index='" + _currentConfigIndex + "']");
                if (savedConfigBtn) {
                    let configButton = this.generateButtonFromConfig(savedConfig.json, _currentConfigIndex);
                    savedConfigBtn.replaceWith(configButton);
                    makeDoubleClick($('.' + SAVED_CONFIG_BUTTON_CLASS + "[data-index='" + _currentConfigIndex + "']"), that.overrideConfig, that.previewWithConfig);
                }
            }
            that.updateSavedConfigsSelection(_currentConfigIndex);
        });

        this.updateSaveConfigControls();
    }
}