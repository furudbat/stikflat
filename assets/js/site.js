/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify */
(function () {
    'use strict';

    /// https://stackoverflow.com/questions/13639464/javascript-equivalent-to-pythons-format
    String.prototype.format = function () {
        var args = arguments;
        var unkeyed_index = 0;
        return this.replace(/\{(\w*)\}/g, (match, key) => {
            if (key === '') {
                key = unkeyed_index;
                unkeyed_index++;
            }
            if (key == +key) {
                return args[key] !== 'undefined'
                    ? args[key]
                    : match;
            } else {
                for (var i = 0; i < args.length; i++) {
                    if (typeof args[i] === 'object' && typeof args[i][key] !== 'undefined') {
                        return args[i][key];
                    }
                }
                return match;
            }
        });
    };

    /// https://stackoverflow.com/questions/19491336/how-to-get-url-parameter-using-jquery-or-plain-javascript
    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };


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

    const TEMPLATE_EDITOR_NAME_CODEMIRROR = 'CodeMirror';
    const TEMPLATE_EDITOR_NAME_TINYMCE = 'TinyMCE';
    const TEMPLATE_EDITOR_NAME_FROALAEDITOR = 'FroalaEditor';

    const CONFIG_CONTENT_MODE_JSON = 'application/json';
    const CONFIG_CONTENT_MODE_YAML = 'text/x-yaml';

    var _templateEditor = null;
    var _templateWYSIWYGEditor = null;
    var _configEditorJSON = null;
    var _configEditorYAML = null;
    var _cssEditor = null;
    var _codePreviewEditor = null;

    var _templateCode = '';
    var _configJson = {};
    var _configJsonStr = '';
    var _configYamlStr = '';
    var _cssCode = '';
    var _codePreview = '';
    var _currentPattern = '';
    var _lockConfigCode = false;
    var _enableWYSIWYGTemplateEditor = false;
    var _enableLivePreview = true;
    var _currentTemplateEditorName = '';
    var _currentWYSIWYGTemplateEditorName = '';
    var _configContentMode = CONFIG_CONTENT_MODE_JSON;

    var _currentConfigIndex = null;
    var _savedConfigs = [];

    function loadFromStorage() {
        if (STORAGE_AVAILABLE === true) {
            _templateCode = localStorage.getItem(STORAGE_KEY_TEMPLATE_CODE) || _templateCode;

            try {
                _configJson = $.parseJSON(localStorage.getItem(STORAGE_KEY_CONFIG_CODE)) || _configJson;
            } catch (e) {
                console.error({ loadFromStorage: 'parse CONFIG_CODE', e });
                _configJson = {};
            }
            _configJsonStr = localStorage.getItem(STORAGE_KEY_CONFIG_CODE_JSON) || getConfigCodeJSON();
            _configYamlStr = localStorage.getItem(STORAGE_KEY_CONFIG_CODE_YAML) || getConfigCodeYAML();

            _cssCode = localStorage.getItem(STORAGE_KEY_CSS_CODE) || _cssCode;
            _lockConfigCode = localStorage.getItem(STORAGE_KEY_LOCK_CONFIG_CODE) === 'true' || _lockConfigCode;
            _enableWYSIWYGTemplateEditor = localStorage.getItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR) === 'true' || _enableWYSIWYGTemplateEditor;
            _enableLivePreview = localStorage.getItem(STORAGE_KEY_ENABLE_LIVE_PREVIEW) === 'true' || _enableLivePreview;
            _configContentMode = localStorage.getItem(STORAGE_KEY_CONFIG_CONTENT_MODE) || _configContentMode;

            try {
                _currentConfigIndex = parseInt(localStorage.getItem(STORAGE_KEY_CURRENT_CONFIG_INDEX)) || _currentConfigIndex;
            } catch (e) {
                console.error({ loadFromStorage: 'parse CURRENT_CONFIG_INDEX', e });
                _currentConfigIndex = null;
            }
            try {
                _savedConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY_SAVED_CONFIGS)) || _savedConfigs;
                if (!$.isArray(_savedConfigs)) {
                    console.error({ loadFromStorage: 'parse SAVED_CONFIGS', message: 'not an array' });
                    _savedConfigs = [];
                }
            } catch (e) {
                console.error({ loadFromStorage: 'parse SAVED_CONFIGS', e });
                _savedConfigs = [];
            }

            //console.debug('loadFromStorage', { _templateCode, _configJson, _cssCode, _lockConfigCode, _enableWYSIWYGTemplateEditor, _enableLivePreview, _currentConfigIndex, _savedConfigs });
        } else {
            console.log('no local storage available');
        }
    }

    function clearTemplateStorage() {
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
    function clearSavedConfigsStorage() {
        if (STORAGE_AVAILABLE === true) {
            localStorage.removeItem(STORAGE_KEY_CURRENT_CONFIG_INDEX);
            localStorage.removeItem(STORAGE_KEY_SAVED_CONFIGS);
        }
    }

    function getTemplateCode() {
        return _templateCode;
    }
    function getConfigJson() {
        return _configJson;
    }
    function getConfigCodeJSON() {
        return JSON.stringify(_configJson, null, 4);
    }
    function getConfigCodeYAML() {
        return jsyaml.dump(_configJson, { indent: 4, lineWidth: 80 });
    }
    function getConfigContentMode() {
        return _configContentMode;
    }
    function getCssCode() {
        return _cssCode;
    }

    function setTemplateCode(code) {
        _templateCode = code;
        localStorage.setItem(STORAGE_KEY_TEMPLATE_CODE, code);
    }
    function setConfigJson(json) {
        if (json !== null) {
            _configJson = json;
            localStorage.setItem(STORAGE_KEY_CONFIG_CODE, JSON.stringify(json));
        }
    }
    function setCssCode(code) {
        _cssCode = code;
        localStorage.setItem(STORAGE_KEY_CSS_CODE, code);
    }
    function setCodePreview(code) {
        _codePreview = code;
        _codePreviewEditor.setValue(code);

        setTimeout(function () {
            _codePreviewEditor.refresh();
        }, 100);
    }
    function setCodeContentMode(mode) {
        _configContentMode = mode;
        localStorage.setItem(STORAGE_KEY_CONFIG_CONTENT_MODE, mode);
    }
    function updateConfigCodesStr() {
        _configJsonStr = getConfigCodeJSON();
        _configYamlStr = getConfigCodeYAML();
    }


    function getSavedConfigsArray() {
        return _savedConfigs;
    }
    function getCurrentSavedConfigJson() {
        return (_currentConfigIndex !== null && _currentConfigIndex < _savedConfigs.length) ? _savedConfigs[_currentConfigIndex] : null;
    }
    function saveConfigs() {
        localStorage.setItem(STORAGE_KEY_CURRENT_CONFIG_INDEX, _currentConfigIndex);
        localStorage.setItem(STORAGE_KEY_SAVED_CONFIGS, JSON.stringify(_savedConfigs));
    }
    function addConfig(json, jsonstr, yamlstr) {
        if (json !== null) {
            _savedConfigs.push({ json, jsonstr, yamlstr });
            _currentConfigIndex = _savedConfigs.length - 1;
            saveConfigs();
        }
    }
    function saveConfig(index, json, jsonstr, yamlstr) {
        if (index < _savedConfigs.length) {
            _savedConfigs[index] = { json, jsonstr, yamlstr };
            saveConfigs();
        }
    }

    function generateHTMLFromTemplate(template, json, css, onlypreview = false) {
        if (typeof json === 'string' || json instanceof String) {
            clearConfigError();
            try {
                if (json !== '') {
                    json = JSON.parse(json);
                }
            } catch (error) {
                json = {};
                var html = error.toString();
                if (onlypreview === true) {
                    setHTMLPreview(html, css);
                } else {
                    setConfigError(html);
                }
            }
        }

        if (json !== null) {
            clearTemplateError();
            try {
                var htmlstr = Mustache.render(template, json);
                setHTMLPreview(htmlstr, css);
                if (onlypreview === false) {
                    setCodePreview(html_beautify(htmlstr));
                }
            } catch (error) {
                console.error(error);

                if (onlypreview === true) {
                    setHTMLPreview(error.toString(), css);
                } else {
                    setTemplateError(error.toString());
                    setHTMLPreview(error.toString(), css);
                    setCodePreview(error.toString());
                }
            }
        }
    }

    function setHTMLPreview(htmlstr, css) {
        var html = $.parseHTML('<style>' + css + '</style>' + htmlstr);
        $('#preview-html').html(html);
    }

    function generateHTML() {
        var template = getTemplateCode();
        var json = getConfigCodeJSON();
        var css = getCssCode();

        generateHTMLFromTemplate(template, json, css);
    }

    function generateTemplateWYSIWYGEditor() {
        if (USE_FROLALA_EDITOR) {
            _templateWYSIWYGEditor = new FroalaEditor('#txtTemplateWYSIWYG', {
                theme: 'dark',
                iconsTemplate: 'font_awesome_5',
                heightMin: 300,
                toolbarButtons: [
                    'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'specialCharacters', '|', 'textColor', 'emoticons', '|', 'paragraphFormat',
                    'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote',
                    'inlineClass', 'fontAwesome', 'spellChecker',
                    'insertLink', 'insertImage', 'insertTable', 'undo', 'redo', 'clearFormating', 'html', 'fullscreen',
                    'help'
                ],
                events: {
                    contentsChanged: function (e, editor) {
                        setTemplateCode(editor.html.get());
                        if (_enableLivePreview === true) {
                            generateHTML();
                        }
                    }
                }
            }, function () {
                _templateWYSIWYGEditor.html.set(getTemplateCode());
            });
            _currentWYSIWYGTemplateEditorName = TEMPLATE_EDITOR_NAME_FROALAEDITOR;
        } else {
            tinymce.init({
                selector: '#txtTemplateWYSIWYG',
                height: 500,
                menubar: false,
                skin: 'oxide-dark',
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                ],
                toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                setup: function (ed) {
                    ed.on('change', function (e) {
                        setTemplateCode(ed.getContent());
                        if (_enableLivePreview === true) {
                            generateHTML();
                        }
                    });
                }
            });
            _templateWYSIWYGEditor = tinymce.get('txtTemplateWYSIWYG');
            _templateWYSIWYGEditor.setContent(getTemplateCode());
            _currentWYSIWYGTemplateEditorName = TEMPLATE_EDITOR_NAME_TINYMCE;
        }
    }

    function generateTemplateEditor() {
        _templateEditor = CodeMirror.fromTextArea(document.getElementById('txtTemplate'), {
            value: getCssCode(),
            mode: 'text/html',
            //theme: 'dracula',
            lineNumbers: true,
            autoRefresh: true
        });
        _templateEditor.on('changes', function (cm, changes) {
            setTemplateCode(cm.getValue());
            if (_enableLivePreview === true) {
                generateHTML();
            }
        });
        _currentTemplateEditorName = TEMPLATE_EDITOR_NAME_CODEMIRROR;
    }

    function generateConfigEditor() {
        _configEditorJSON = CodeMirror.fromTextArea(document.getElementById('txtConfigJSON'), {
            value: _configJsonStr || getConfigCodeJSON(),
            mode: CONFIG_CONTENT_MODE_JSON,
            //theme: 'dracula',
            lineNumbers: true,
            linter: true,
            spellcheck: true,
            autoRefresh: true
        });
        _configEditorJSON.on('changes', function (cm, changes) {
            var _configJsonStr = cm.getValue();
            localStorage.setItem(STORAGE_KEY_CONFIG_CODE_JSON, _configJsonStr);
            try {
                if (_configJsonStr !== '') {
                    var config = $.parseJSON(_configJsonStr);
                    setConfigJson(config);
                    if (_enableLivePreview === true) {
                        generateHTML();
                    }
                }
            } catch (error) {
                setConfigError(error.toString());
            }
        });

        _configEditorYAML = CodeMirror.fromTextArea(document.getElementById('txtConfigYAML'), {
            value: _configYamlStr || getConfigCodeYAML(),
            mode: CONFIG_CONTENT_MODE_YAML,
            //theme: 'dracula',
            lineNumbers: true,
            linter: true,
            spellcheck: true,
            autoRefresh: true,
            indentWithTabs: false
        });
        _configEditorYAML.on('changes', function (cm, changes) {
            var _configYamlStr = cm.getValue();
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
                setConfigError(error.toString());
            }
        });
    }

    function generateCssEditor() {
        _cssEditor = CodeMirror.fromTextArea(document.getElementById('txtCSS'), {
            value: getCssCode(),
            mode: 'text/css',
            //theme: 'dracula',
            //lineNumbers: true,
            linter: true,
            autoRefresh: true
        });
        _cssEditor.on('changes', function (cm, changes) {
            setCssCode(cm.getValue());
            if (_enableLivePreview === true) {
                generateHTML();
            }
        });
    }

    function generateCodePreviewEditor() {
        _codePreviewEditor = CodeMirror.fromTextArea(document.getElementById('txtPreviewCode'), {
            mode: 'text/html',
            //theme: 'dracula',
            lineNumbers: true,
            readOnly: true,
            autoRefresh: true
        });
    }

    function setTemplateEditorValue(code) {
        if (WITH_WYSIWYG_EDITOR === true) {
            if (_currentWYSIWYGTemplateEditorName === TEMPLATE_EDITOR_NAME_TINYMCE) {
                _templateWYSIWYGEditor.setContent(code);
            } else if (_currentWYSIWYGTemplateEditorName === TEMPLATE_EDITOR_NAME_FROALAEDITOR) {
                _templateWYSIWYGEditor.html.set(code);
            }
        }

        _templateEditor.setValue(code);

        setTimeout(function () {
            _templateEditor.refresh();
        }, 100);
    }

    function initEditors() {
        setTemplateEditorValue(getTemplateCode());
        _cssEditor.setValue(getCssCode());
        if (getConfigContentMode() == CONFIG_CONTENT_MODE_JSON) {
            _configEditorJSON.setValue(_configJsonStr);
            $(_configEditorJSON.getWrapperElement()).show();
            $(_configEditorYAML.getWrapperElement()).hide();
        } else {
            _configEditorYAML.setValue(_configYamlStr);
            $(_configEditorJSON.getWrapperElement()).hide();
            $(_configEditorYAML.getWrapperElement()).show();
        }

        setTimeout(function () {
            _cssEditor.refresh();
            _configEditorJSON.refresh();
            _configEditorYAML.refresh();
        }, 100);
    }


    function enableWYSIWYGEditor() {
        _enableWYSIWYGTemplateEditor = true;
        localStorage.setItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR, _enableWYSIWYGTemplateEditor);

        initEditors();

        $('.main-template-editors-editor-container').hide();
        $('.main-template-editors-WYSIWYG-editor-container').show();
        $('#btnEnableWYSIWYGEditor').html(site.data.strings.editor.template.enabled_WYSIWYG_editor_btn).attr('class', 'btn btn-secondary');
    }
    function disableWYSIWYGEditor() {
        _enableWYSIWYGTemplateEditor = false;
        localStorage.setItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR, _enableWYSIWYGTemplateEditor);

        initEditors();

        $('.main-template-editors-editor-container').show();
        $('.main-template-editors-WYSIWYG-editor-container').hide();
        $('#btnEnableWYSIWYGEditor').html(site.data.strings.editor.template.disabled_WYSIWYG_editor_btn).attr('class', 'btn btn-outline-secondary');
    }

    function enableLivePreview() {
        _enableLivePreview = true;
        localStorage.setItem(STORAGE_KEY_ENABLE_LIVE_PREVIEW, _enableLivePreview);
        $('#chbLivePreviewHelp').html(site.data.strings.editor.template.enabled_live_preview_help);
    }
    function disableLivePreview() {
        _enableLivePreview = false;
        localStorage.setItem(STORAGE_KEY_ENABLE_LIVE_PREVIEW, _enableLivePreview);
        $('#chbLivePreviewHelp').html(site.data.strings.editor.template.disabled_live_preview_help);
    }


    function lockConfig() {
        _lockConfigCode = true;
        localStorage.setItem(STORAGE_KEY_LOCK_CONFIG_CODE, _lockConfigCode);
        $('#chbLockConfigHelp').html(site.data.strings.editor.config.lock_config_help);
    }
    function unlockConfig() {
        _lockConfigCode = false;
        localStorage.setItem(STORAGE_KEY_LOCK_CONFIG_CODE, _lockConfigCode);
        $('#chbLockConfigHelp').html(site.data.strings.editor.config.unlock_config_help);
    }


    function selectPreviewTab() {
        $('#templateTabs a[href="#previewTabContent"]').tab('show');
    }
    function selectTemplateTab() {
        $('#templateTabs a[href="#templateTabContent"]').tab('show');

        setTimeout(function () {
            _templateEditor.refresh();
        }, 100);
    }
    function selectCssTab() {
        $('#templateTabs a[href="#cssTabContent"]').tab('show');

        setTimeout(function () {
            _cssEditor.refresh();
        }, 100);
    }



    function setConfigError(error) {
        $('#configError').html(error).show();
        updateSaveConfigControls();
    }
    function clearConfigError() {
        $('#configError').hide().empty();
        updateSaveConfigControls();
    }

    function setTemplateError(error) {
        $('#configError').html(error).show();
    }
    function clearTemplateError() {
        $('#templateError').hide().empty();
    }

    function clearLayoutInfo() {
        $('#msgLayoutPatternInfo').hide().empty();
    }
    function updateLayoutInfo(pattern) {
        if (pattern === null) {
            console.log('updateLayoutInfo', { pattern });
            return;
        }

        var name = $(pattern).data('name');
        var author = $(pattern).data('author');
        var authorLink = $(pattern).data('author-link');
        var description = $(pattern).data('description');
        var link = $(pattern).data('link');
        var license = $(pattern).data('license');

        var header = '<p class="text-bold">';
        header += name + site.data.strings.layouts.by_author + '<a href="' + authorLink + '" target="_blank">' + author + '</a>';
        if (link !== '') {
            header += ' - ' + '<a href="' + link + '" target="_blank">' + link + '</a>';
        }
        header += '</p>';

        var options = {/* … */ };

        $('#msgLayoutPatternInfo').empty()
            .append(header)
            .append('<p class="text-justify">' + description.linkify(options) + '</p>')
            .append('<p class="font-italic">' + license.linkify(options) + '</p>')
            .show();
    }


    const SAVED_CONFIG_SELECTED_BUTTON_CLASS = 'btn-primary';
    const SAVED_CONFIG_NOT_SELECTED_BUTTON_CLASS = 'btn-outline-secondary';
    const SAVED_CONFIG_BUTTON_CLASS = 'saved-content-content';

    function generateButtonFromConfig(config, index = '') {
        var cssclass = 'mr-1 mt-1 mb-2 btn ' + SAVED_CONFIG_BUTTON_CLASS + ' ' + SAVED_CONFIG_NOT_SELECTED_BUTTON_CLASS
        var name = site.data.strings.content.content_default_prefix + ((index !== '') ? ' ' + (index + 1) : '');
        if (config) {
            if ('title' in config && config.title !== '') {
                name = config.title;
            } else if ('name' in config && config.name !== '') {
                name = config.name;
            }
        }

        var configButton = $('<button type="button" class="' + cssclass + '" data-index="' + index + '">' + name + '</button>');
        return configButton;
    }

    var overrideConfig = function (configButton) {
        var index = $(configButton).data('index');
        if (index === null || index === '') {
            return;
        }

        //console.debug('overrideConfig', {index, configButton});

        _currentConfigIndex = parseInt(index);

        var savedConfig = getCurrentSavedConfigJson();
        if (savedConfig !== null) {
            setConfigJson(savedConfig.json);
            _configJsonStr = savedConfig.jsonstr;
            _configYamlStr = savedConfig.yamlstr;

            initEditors();
            generateHTML();
        } else {
            _currentConfigIndex = null;
        }

        updateSaveConfigControls();
        updateSavedConfigsSelection(_currentConfigIndex);
    };

    var previewWithConfig = function (configButton) {
        var index = $(configButton).data('index');
        if (index === null || index === '') {
            return;
        }

        //console.debug('previewWithConfig', {index, configButton});

        _currentConfigIndex = parseInt(index);

        var savedConfig = getCurrentSavedConfigJson();
        if (savedConfig !== null) {
            var template = getTemplateCode();
            var css = getCssCode();

            generateHTMLFromTemplate(template, savedConfig.json, css, true);
            selectPreviewTab();
        }
    };
    function addSavedConfigToList(config, index) {
        if (config === null || index === null) {
            return;
        }
        var configButton = generateButtonFromConfig(config, index);
        $('.saved-content-list').append(configButton);
        makeDoubleClick($('.' + SAVED_CONFIG_BUTTON_CLASS + "[data-index='" + index + "']"), overrideConfig, previewWithConfig);

        //console.debug('addSavedConfigToList', index, config, configButton, $('.saved-content-list').find('.' + SAVED_CONFIG_BUTTON_CLASS).last());

        updateSaveConfigControls();
    }
    function generateSavedConfigsFromList() {
        if (_savedConfigs.length > 0) {
            $('.saved-content-list').empty();
            for (var i = 0; i < _savedConfigs.length; i++) {
                var config = _savedConfigs[i];
                console.log(i, config);
                addSavedConfigToList(config, i);
            }
            $('.saved-content-container').show();
        } else {
            $('.saved-content-list').empty();
            $('.saved-content-container').hide();
        }

        updateSavedConfigsSelection(_currentConfigIndex);
    }
    function updateSaveConfigControls() {
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
    function updateSavedConfigsSelection(index) {
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

    function initSaveConfigControls() {
        var savedConfigs = $('.' + SAVED_CONFIG_BUTTON_CLASS);

        if (savedConfigs && savedConfigs.length) {
            savedConfigs.each(function () {
                makeDoubleClick($(this), overrideConfig, previewWithConfig);
            });
        }
        $('#btnAddConfig').click(function () {
            addConfig(getConfigJson(), _configJsonStr, _configYamlStr);
            //console.debug('btnAddConfig', {_currentConfigIndex});

            var savedConfig = getCurrentSavedConfigJson();
            if (savedConfig !== null) {
                addSavedConfigToList(savedConfig.json, _currentConfigIndex);
            }
            updateSavedConfigsSelection(_currentConfigIndex);
        });

        $('#btnSaveConfig').click(function () {
            saveConfig(_currentConfigIndex, getConfigJson(), _configJsonStr, _configYamlStr);

            var savedConfig = getCurrentSavedConfigJson();
            if (savedConfig !== null) {
                var savedConfigBtn = $('.' + SAVED_CONFIG_BUTTON_CLASS + "[data-index='" + _currentConfigIndex + "']");
                if (savedConfigBtn) {
                    var configButton = generateButtonFromConfig(savedConfig.json, _currentConfigIndex);
                    savedConfigBtn.replaceWith(configButton);
                    makeDoubleClick($('.' + SAVED_CONFIG_BUTTON_CLASS + "[data-index='" + _currentConfigIndex + "']"), overrideConfig, previewWithConfig);
                }
            }
            updateSavedConfigsSelection(_currentConfigIndex);
        });

        updateSaveConfigControls();
    }

    function changeConfigMode(mode) {
        updateConfigCodesStr();
        setCodeContentMode(mode);
        initEditors();
    }


    /// https://css-tricks.com/snippets/javascript/bind-different-events-to-click-and-double-click/
    var makeDoubleClick = function (element, doDoubleClickAction, doClickAction) {
        var timer = 0;
        var delay = 250;
        var prevent = false;

        element.on('click', function (e) {
            var that = this;
            timer = setTimeout(() => {
                if (!prevent) {
                    doClickAction(that);
                }
                prevent = false;
            }, delay);
        }).on('dblclick', function (e) {
            clearTimeout(timer);
            prevent = true;
            doDoubleClickAction(this);
        });
    };
    $(document).ready(function () {
        loadFromStorage();

        setTemplateCode(_templateCode);
        setConfigJson(_configJson);
        setCssCode(_cssCode);

        generateSavedConfigsFromList();
        initSaveConfigControls();

        clearConfigError();
        clearTemplateError();
        clearLayoutInfo();

        generateTemplateEditor();
        if (WITH_WYSIWYG_EDITOR === true) {
            generateTemplateWYSIWYGEditor();
        }
        generateConfigEditor();
        generateCssEditor();
        generateCodePreviewEditor();

        if (getConfigContentMode() === CONFIG_CONTENT_MODE_YAML) {
            $('#chbConfigMode').bootstrapToggle('on');
            changeConfigMode(CONFIG_CONTENT_MODE_YAML);
        } else {
            $('#chbConfigMode').bootstrapToggle('off');
            changeConfigMode(CONFIG_CONTENT_MODE_JSON);
        }

        generateHTML();

        if (_lockConfigCode === true) {
            $('#chbLockConfig').bootstrapToggle('on');
            lockConfig();
        } else {
            $('#chbLockConfig').bootstrapToggle('off');
            unlockConfig();
        }
        if (_enableLivePreview === true) {
            $('#chbLivePreview').prop('checked', true);
            enableLivePreview();
        } else {
            $('#chbLivePreview').prop('checked', false);
            disableLivePreview();
        }
        if (WITH_WYSIWYG_EDITOR === true) {
            if (_enableWYSIWYGTemplateEditor === true) {
                enableWYSIWYGEditor();
            } else {
                disableWYSIWYGEditor();
            }
        } else {
            disableWYSIWYGEditor();
        }

        /*
        if (getTemplateCode() === '') {
            selectPreviewTab();
        } else {
            selectTemplateTab();
        }
        */
        var btnPreviewCodeCopy = new ClipboardJS('#btnPreviewCodeCopy', {
            text: function (trigger) {
                return _codePreview;
            }
        });
        btnPreviewCodeCopy.on('success', function (e) {
            $('#btnPreviewCodeCopy').popover('show');
            e.clearSelection();
        });
        $('[data-toggle="popover"]').popover();
        $('#btnPreviewCodeCopy').on('shown.bs.popover', function () {
            var $pop = $(this);
            setTimeout(function () {
                $pop.popover('hide');
            }, 1200);
        });

        $('#collapseConfig').collapse('show');

        $('.main-template-editors-preview-container').resizable();

        $('#templateTabs a[href="#previewTabContent"]').on('click', function (e) {
            selectPreviewTab();
        });
        $('#templateTabs a[href="#templateTabContent"]').on('click', function (e) {
            selectTemplateTab();
        });
        $('#templateTabs a[href="#cssTabContent"]').on('click', function (e) {
            selectCssTab();
        });

        if (WITH_WYSIWYG_EDITOR === true) {
            $('#btnEnableWYSIWYGEditor').click(function () {
                enableWYSIWYGTemplateEditor = !_enableWYSIWYGTemplateEditor;
                if (_enableWYSIWYGTemplateEditor === true) {
                    enableWYSIWYGEditor();
                } else {
                    disableWYSIWYGEditor();
                }
            });
        }

        $('#chbLivePreview').change(function () {
            var checked = $(this).prop('checked');
            if (checked === true) {
                enableLivePreview();
            } else {
                disableLivePreview();
            }
        });
        $('#chbLockConfig').change(function () {
            var checked = $(this).prop('checked');
            if (checked === true) {
                lockConfig();
            } else {
                unlockConfig();
            }
        });
        $('#chbConfigMode').change(function () {
            var checked = $(this).prop('checked');
            if (checked === true) {
                changeConfigMode(CONFIG_CONTENT_MODE_YAML);
            } else {
                changeConfigMode(CONFIG_CONTENT_MODE_JSON);
            }
        });
        $('.generate-btn').each(function (index) {
            $(this).click(function () {
                generateHTML();

                $('html, body').animate({
                    scrollTop: $('#sectionPreviewCode').offset().top
                }, 500);
            });
        });
        $('#btnClearTemplateStorage').click(function () {
            clearTemplateStorage();
        });
        $('#btnClearSavedConfigsStorage').click(function () {
            clearSavedConfigsStorage();
        });

        $('#collapseConfig').on('show.bs.collapse', function () {
            $('.main-template-editors-preview-container').removeClass('bigger-preview');
            
            $('.main-config-editors-container').removeClass(function (index, className) {
                return (className.match(/(^|\s)col-\S+/g) || []).join(' ');
            }).addClass('col-md-4');
            $('.main-template-editors-container').removeClass(function (index, className) {
                return (className.match(/(^|\s)col-\S+/g) || []).join(' ');
            }).addClass('col-md-8');
        });
        $('#collapseConfig').on('shown.bs.collapse', function () {
            $('#btnCollapseConfig').html(site.data.strings.editor.config.header).attr('class', 'btn btn-primary');
            $('.main-config-add-container').show();
            updateSaveConfigControls();
        });
        $('#collapseConfig').on('hidden.bs.collapse', function () {
            $('.main-config-editors-container').removeClass(function (index, className) {
                return (className.match(/(^|\s)col-\S+/g) || []).join(' ');
            }).addClass('col-md-2');
            $('.main-template-editors-container').removeClass(function (index, className) {
                return (className.match(/(^|\s)col-\S+/g) || []).join(' ');
            }).addClass('col-md-10');

            $('.main-template-editors-preview-container').addClass('bigger-preview');
        });
        $('#collapseConfig').on('hide.bs.collapse', function () {
            $('#btnCollapseConfig').html(site.data.strings.editor.config.header_short).attr('class', 'btn btn-secondary');
            $('.main-config-add-container').hide();
        });


        var overrideLayout = function (layout) {
            //console.debug('layout-pattern dblclick', layout);

            var name = $(layout).data('name');
            var keywordsStr = $(layout).data('keywords');
            var configlink = $(layout).data('config');
            var getTemplate = $.get($(layout).data('template'));
            var getConfig = $.get($(layout).data('config'));
            var getCSS = $.get($(layout).data('css'));

            $.when(getTemplate, getConfig, getCSS).done((templateRes, configRes, cssRes) => {
                _currentPattern = name;
                var template = templateRes[0];
                var css = cssRes[0];

                var config = configRes[0];
                if (_lockConfigCode === true) {
                    config = _configJson;
                }

                var configJson = {};
                try {
                    if (typeof config === 'string' || config instanceof String) {
                        configJson = $.parseJSON(config, null, 4);
                    } else {
                        configJson = config;
                    }
                } catch (e) {
                    console.error(e);
                }

                setTemplateCode(template);
                setConfigJson(configJson);
                updateConfigCodesStr();
                setCssCode(css_beautify(css));

                initEditors();
                generateHTML();

                var keywordsArr = keywordsStr.split(", ").map(Function.prototype.call, String.prototype.trim);
                var keywords = keywordsArr.map(it => `<code>${it}</code>`).join(', ');
                $('#configHelpKeywords').html(site.data.strings.editor.config.keywords_help.format(keywords, configlink));

                /*
                if ($('#previewTabContent').hasClass('show')) {
                    selectTemplateTab();
                }
                */
                $('html, body').animate({
                    scrollTop: $('#sectionEditor').offset().top
                }, 500);
            });
            updateLayoutInfo(layout);
        };

        var previewLayout = function (layout) {
            //console.debug('layout-pattern click', layout);

            var name = $(layout).data('name');
            var getTemplate = $.get($(layout).data('template'));
            var getConfig = $.get($(layout).data('config'));
            var getCSS = $.get($(layout).data('css'));

            $.when(getTemplate, getConfig, getCSS).done((templateRes, configRes, cssRes) => {
                _currentPattern = name;

                var template = templateRes[0];
                var config = configRes[0];
                var css = cssRes[0];

                generateHTMLFromTemplate(template, config, css, true);
                selectPreviewTab();
            });
            updateLayoutInfo(layout);
        };
        makeDoubleClick($('.layout-pattern'), overrideLayout, previewLayout);
    });
}());