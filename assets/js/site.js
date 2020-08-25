/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify */
/// @TODO: refactor this monolith x.x
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
                return (args[key] !== 'undefined') ? args[key] : match;
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

    var isOnScreen = function (element, factor_width = 1.0, factor_height = 1.0) {
        var win = $(window);
        var viewport = {
            top: win.scrollTop(),
            left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();

        var bounds = $(element).offset();
        bounds.right = bounds.left + ($(element).outerWidth() * factor_width);
        bounds.bottom = bounds.top + ($(element).outerHeight() * factor_height);

        //console.debug('isOnScreen', viewport, bounds);
        //console.debug('isOnScreen', bounds.left >= viewport.left, bounds.top >= viewport.top, bounds.right <= viewport.right, bounds.bottom <= viewport.bottom);

        return !(bounds.left >= viewport.left && bounds.top >= viewport.top && bounds.right <= viewport.right && bounds.bottom <= viewport.bottom);
    };

    var countlines = function (str) {
        return (str !== null && str !== "") ? str.split(/\r\n|\r|\n/).length : 0;
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
    const TEMPLATE_EDITOR_NAME_ACE = 'ace';

    const CONFIG_CONTENT_MODE_JSON = 'application/json';
    const CONFIG_CONTENT_MODE_YAML = 'text/x-yaml';

    const SCROLL_TO_ANIMATION_TIME_MS = 600;

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
    var _currentLayoutId = '';
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
                _savedConfigs = $.parseJSON(localStorage.getItem(STORAGE_KEY_SAVED_CONFIGS)) || _savedConfigs;
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

        if (USE_ACE) {
            _codePreviewEditor.clearSelection();
        }

        if (USE_CODEMIRROR) {
            //setTimeout(function () {
            _codePreviewEditor.refresh();
            //}, 100);
        }
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
                    json = jsonlint.parse(json);
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
        var onChangeTemplate = function (value) {
            setTemplateCode(value);
            updateTemplateLinesOfCodeBadges(value);
            if (_enableLivePreview === true) {
                generateHTML();
            }
        };
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
                        onChangeTemplate(editor.html.get());
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
                        onChangeTemplate(ed.getContent());
                    });
                }
            });
            _templateWYSIWYGEditor = tinymce.get('txtTemplateWYSIWYG');
            _templateWYSIWYGEditor.setContent(getTemplateCode());
            _currentWYSIWYGTemplateEditorName = TEMPLATE_EDITOR_NAME_TINYMCE;
        }
    }

    function generateTemplateEditor() {
        var onChangeTemplateEditor = function (value) {
            setTemplateCode(value);
            updateTemplateLinesOfCodeBadges(value);
            if (_enableLivePreview === true) {
                generateHTML();
            }
        };
        if (USE_ACE) {
            $('#txtTemplate').replaceWith('<pre id="txtTemplate" class="pre-ace-editor"></pre>');
            _templateEditor = ace.edit("txtTemplate");
            //_templateEditor.setTheme("ace/theme/dracula");
            _templateEditor.session.setMode("ace/mode/html");
            _templateEditor.session.on('change', function (delta) {
                // delta.start, delta.end, delta.lines, delta.action
                onChangeTemplateEditor(_templateEditor.getValue());
            });
            _currentTemplateEditorName = TEMPLATE_EDITOR_NAME_ACE;
        }
        if (USE_CODEMIRROR) {
            _templateEditor = CodeMirror.fromTextArea(document.getElementById('txtTemplate'), {
                value: getTemplateCode(),
                mode: 'text/html',
                //theme: 'dracula',
                lineNumbers: true,
                autoRefresh: true,
                lint: true,
                gutters: ["CodeMirror-lint-markers"],
                extraKeys: { "Ctrl-Space": "autocomplete" }
            });
            _templateEditor.on('changes', function (cm, changes) {
                onChangeTemplateEditor(cm.getValue());
            });
            _currentTemplateEditorName = TEMPLATE_EDITOR_NAME_CODEMIRROR;
        }
    }

    function generateConfigEditor() {
        var onChangeConfigJSON = function (value) {
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
                setConfigError(error.toString());
            }
        };
        var onChangeConfigYAML = function (value) {
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
                setConfigError(error.toString());
            }
        };
        if (USE_ACE) {
            $('#txtConfigJSON').replaceWith('<pre id="txtConfigJSON" class="pre-ace-editor"></pre>');
            _configEditorJSON = ace.edit("txtConfigJSON");
            //_configEditorJSON.setTheme("ace/theme/dracula");
            _configEditorJSON.session.setMode("ace/mode/json");
            _configEditorJSON.session.on('change', function (delta) {
                // delta.start, delta.end, delta.lines, delta.action
                onChangeConfigJSON(_configEditorJSON.getValue());
            });

            $('#txtConfigYAML').replaceWith('<pre id="txtConfigYAML" class="pre-ace-editor"></pre>');
            _configEditorYAML = ace.edit("txtConfigYAML");
            //_configEditorYAML.setTheme("ace/theme/dracula");
            _configEditorYAML.session.setMode("ace/mode/yaml");
            _configEditorYAML.session.on('change', function (delta) {
                // delta.start, delta.end, delta.lines, delta.action
                onChangeConfigYAML(_configEditorYAML.getValue());
            });
        }
        if (USE_CODEMIRROR) {
            _configEditorJSON = CodeMirror.fromTextArea(document.getElementById('txtConfigJSON'), {
                value: _configJsonStr || getConfigCodeJSON(),
                mode: CONFIG_CONTENT_MODE_JSON,
                //theme: 'dracula',
                lineNumbers: true,
                lint: true,
                gutters: ["CodeMirror-lint-markers"],
                spellcheck: true,
                autoRefresh: true
            });
            _configEditorJSON.on('changes', function (cm, changes) {
                onChangeConfigJSON(cm.getValue());
            });

            _configEditorYAML = CodeMirror.fromTextArea(document.getElementById('txtConfigYAML'), {
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
            _configEditorYAML.on('changes', function (cm, changes) {
                onChangeConfigYAML(cm.getValue());
            });
        }
    }

    function generateCssEditor() {
        var onChangeCSS = function (value) {
            setCssCode(value);
            updateCssLinesOfCodeBadges(value);
            if (_enableLivePreview === true) {
                generateHTML();
            }
        };
        if (USE_ACE) {
            $('#txtCSS').replaceWith('<pre id="txtCSS" class="pre-ace-editor"></pre>');
            _cssEditor = ace.edit("txtCSS");
            //_cssEditor.setTheme("ace/theme/dracula");
            _cssEditor.session.setMode("ace/mode/json");
            _cssEditor.session.on('change', function (delta) {
                // delta.start, delta.end, delta.lines, delta.action
                onChangeCSS(_cssEditor.getValue());
            });
        }
        if (USE_CODEMIRROR) {
            _cssEditor = CodeMirror.fromTextArea(document.getElementById('txtCSS'), {
                value: getCssCode(),
                mode: 'text/css',
                //theme: 'dracula',
                //lineNumbers: true,
                linter: true,
                autoRefresh: true
            });
            _cssEditor.on('changes', function (cm, changes) {
                onChangeCSS(cm.getValue());
            });
        }
    }

    function generateCodePreviewEditor() {
        if (USE_ACE) {
            $('#txtPreviewCode').replaceWith('<pre id="txtPreviewCode" class="pre-ace-editor"></pre>');
            _codePreviewEditor = ace.edit("txtPreviewCode");
            //_codePreviewEditor.setTheme("ace/theme/dracula");
            _codePreviewEditor.session.setMode("ace/mode/html");
            _codePreviewEditor.setReadOnly(true);
        }
        if (USE_CODEMIRROR) {
            _codePreviewEditor = CodeMirror.fromTextArea(document.getElementById('txtPreviewCode'), {
                mode: 'text/html',
                //theme: 'dracula',
                lineNumbers: true,
                readOnly: true,
                autoRefresh: true
            });
        }
    }

    function updateTemplateLinesOfCodeBadges(code) {
        var loc = countlines(code);
        if (loc > 0) {
            $('#templateEditorLinesBadge').html(site.data.strings.editor.lines.format(loc)).show();
        } else {
            $('#templateEditorLinesBadge').hide();
        }
    }
    function updateCssLinesOfCodeBadges(code) {
        var loc = countlines(code);
        if (loc > 0) {
            $('#cssEditorLinesBadge').html(site.data.strings.editor.lines.format(loc)).show();
        } else {
            $('#cssEditorLinesBadge').hide();
        }
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
        updateTemplateLinesOfCodeBadges(code);

        if (USE_ACE) {
            _templateEditor.clearSelection();
        }
        if (USE_CODEMIRROR) {
            //setTimeout(function () {
            _templateEditor.refresh();
            //}, 100);
        }
    }

    function initEditors() {
        var templateCode = getTemplateCode();
        var cssCode = getCssCode();

        setTemplateEditorValue(templateCode);

        _cssEditor.setValue(cssCode);
        if (getConfigContentMode() == CONFIG_CONTENT_MODE_JSON) {
            _configEditorJSON.setValue(_configJsonStr);

            $('.main-config-json-container').show();
            $('.main-config-yaml-container').hide();
        } else {
            _configEditorYAML.setValue(_configYamlStr);

            $('.main-config-json-container').hide();
            $('.main-config-yaml-container').show();
        }

        updateTemplateLinesOfCodeBadges(templateCode);
        updateCssLinesOfCodeBadges(cssCode);

        if (USE_ACE) {
            _cssEditor.clearSelection();
            _configEditorJSON.clearSelection();
            _configEditorYAML.clearSelection();
        }
        if (USE_CODEMIRROR) {
            //setTimeout(function () {
            _cssEditor.refresh();
            _configEditorJSON.refresh();
            _configEditorYAML.refresh();
            //}, 100);
        }
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

        if (USE_CODEMIRROR) {
            //setTimeout(function () {
            _templateEditor.refresh();
            //}, 100);
        }
    }
    function selectCssTab() {
        $('#templateTabs a[href="#cssTabContent"]').tab('show');

        if (USE_CODEMIRROR) {
            //setTimeout(function () {
            _cssEditor.refresh();
            //}, 100);
        }
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
        $('#msgLayoutPatternInfo').hide();
    }
    function updateLayoutInfo(meta) {
        if (meta === null) {
            console.error('updateLayoutInfo', 'meta is null');
            return;
        }
        _currentLayoutId = meta.id;

        var author = meta.author || '&lt;Unknown&gt;';
        var authorLink = meta.author_link || '';
        var description = meta.description || '';
        var link = meta.link || '';
        var name = meta.name || link;
        var license = meta.license || '';
        var more = meta.more || '';

        var header = (link === '')? name : '<a href="' + link + '" target="_blank">' + name + '</a>';
        header += site.data.strings.info.by_author + '<a href="' + authorLink + '" target="_blank">' + author + '</a>';

        $('#msgLayoutPatternInfoHeader').html(header);
        $('#msgLayoutPatternInfoDescription').html(description);
        $('#msgLayoutPatternInfoLicense').html(license);
        $('#msgLayoutPatternInfoMore').html(more);
        $('#msgLayoutPatternInfo').show();
    }


    const SAVED_CONFIG_SELECTED_BUTTON_CLASS = 'btn-primary';
    const SAVED_CONFIG_NOT_SELECTED_BUTTON_CLASS = 'btn-outline-secondary';
    const SAVED_CONFIG_BUTTON_CLASS = 'saved-content-content';

    function generateButtonFromConfig(config, index = '') {
        var cssclass = 'mr-1 mt-1 mb-2 btn ' + SAVED_CONFIG_BUTTON_CLASS + ' ' + SAVED_CONFIG_NOT_SELECTED_BUTTON_CLASS;
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
            console.error('overrideConfig', 'index is empty');
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
            console.error('previewWithConfig', 'index is empty');
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
            console.error('addSavedConfigToList', 'config or index are null', { config, index });
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
                var config = _savedConfigs[i].json;
                //console.debug(i, config);
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


    function loadLayout(layout, callback) {
        var id = $(layout).data('id');
        var layoutLoading = $('#layout-loading-' + id);
        layoutLoading.show();
        $.ajax({
            url: $(layout).data('meta'),
            method: "GET",
            cache: USE_CACHE
        }).done((metaRes) => {
            var meta = jsyaml.load(metaRes);
            var name = meta.name;
            var configlink = $(layout).data('config');

            var getConfig = $.ajax({
                url: configlink,
                method: "GET",
                cache: USE_CACHE
            });
            var getTemplate = $.ajax({
                url: $(layout).data('template'),
                method: "GET",
                cache: USE_CACHE
            });
            var getCSS = $.ajax({
                url: $(layout).data('css'),
                method: "GET",
                cache: USE_CACHE
            });

            $.when(getTemplate, getConfig, getCSS).done((templateRes, configRes, cssRes) => {
                layoutLoading.hide();
                console.log({ template: templateRes[0], config: configRes[0], css: cssRes[0], meta, name, configlink });
                callback({ template: templateRes[0], config: configRes[0], css: cssRes[0], meta, name, configlink });
            }).fail(function () {
                layoutLoading.hide();
            });
        }).fail(function () {
            layoutLoading.hide();
        });
    }
    

    /// https://css-tricks.com/snippets/javascript/bind-different-events-to-click-and-double-click/
    function makeDoubleClick (element, doDoubleClickAction, doClickAction) {
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
    }

    function generateLayoutList() {
        var templates = [];
        for (const template of site.data.templates) {
            if (('disable' in template && template.disable == true) || ('disabled' in template && template.disabled == true)) {
                continue;
            }

            var type = '';
            if (template.type == 'character') {
                type = '<span  class="badge badge-pill badge-success">' + site.data.strings.layouts.type_character + '</span>';
            } else if (template.type == 'user') {
                type = '<span class="badge badge-pill badge-warning">' + site.data.strings.layouts.type_user + '</span>';
            } else if (template.type == 'codesnippet') {
                type = '<span class="badge badge-pill badge-info">' + site.data.strings.layouts.type_codesnippet + '</span>';
            } else {
                type = '<span class="badge badge-pill badge-danger">' + template.type + '</span>';
            }

            var style = template.style;
            var preview = '';
            var previewstyle = '';
            var cardbodystyle = '';
            var inlinebodystyle = '';
            var inlineauthorstyle = '';
            var colstyle = '';
            if ('preview' in template && template.preview) {
                colstyle = 'flex: 0 0 25%; max-width: 25%;';
                style = 'width: 14rem; min-height: 320px;' + template.style;
                previewstyle = 'min-height: 200px;';
                preview = '<img class="card-img-top" style="max-height: 200px;" src="' + template.preview + '" alt="Preview ' + template.name + '">';
            } else {
                colstyle = 'margin: 0.25rem;';
                cardbodystyle = 'padding: 0.25rem';
                inlinebodystyle = 'display: inline !important;';
                inlineauthorstyle = 'display: inline !important;';
            }

            templates.push({
                colstyle: colstyle,
                style: style,
                template: site.data.templates_url + template.template,
                css: site.data.templates_url + template.css,
                config: site.data.templates_url + template.config,
                meta: site.data.templates_url + template.meta,
                keywords: template.keywords.join(', '),
                id: template.id,
                preview: preview,
                previewstyle: previewstyle,
                cardbodystyle: cardbodystyle,
                inlinebodystyle: inlinebodystyle,
                inlineauthorstyle: inlineauthorstyle,
                name: template.name,
                layoutloadingid: 'layout-loading-' + template.id,
                type: type,
                author: site.data.strings.layouts.by_author + template.author
            });
        }

        var item = `<div class="d-inline colstyle" style="">
            <button type="button" class="btn btn-link card d-inline mr-1 mb-1 layout-pattern style template meta css config keywords id" 
                style="" data-template="" data-css="" data-config="" data-meta="" data-id="" data-keywords="">
                <div class="d-flex flex-wrap align-items-center preview previewstyle" style="">
                </div>
                <div class="card-body cardbodystyle">
                    <div class="spinner-border layoutloadingid" style="display: none" role="status" id="">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <p class="card-text inlinebodystyle">
                        <span class="text-left name"></span>
                        <span class="text-right type"></span>
                    </p>
                    <p class="card-subtitle author inlineauthorstyle"></p>
                </div>
            </div>
        </div>`;

        var options = {
            valueNames: [
                'preview', 'name', 'type', 'author',
                { name: 'template', attr: 'data-template' },
                { name: 'css', attr: 'data-css' },
                { name: 'config', attr: 'data-config' },
                { name: 'meta', attr: 'data-meta' },
                { name: 'keywords', attr: 'data-keywords' },
                { name: 'id', attr: 'data-id' },
                { name: 'layoutloadingid', attr: 'id' },
                { name: 'colstyle', attr: 'style' },
                { name: 'style', attr: 'style' },
                { name: 'previewstyle', attr: 'style' },
                { name: 'cardbodystyle', attr: 'style' },
                { name: 'inlinebodystyle', attr: 'style' },
                { name: 'inlineauthorstyle', attr: 'style' }
            ],
            item: item,
            page: 10,
            pagination: [{
                paginationClass: "paginationBottom",
                innerWindow: 5,
                left: 2,
                right: 2
            }]
        };
        
        var layoutsList = new List('layouts-list', options, templates);

        var overrideLayout = function (layout) {
            //console.debug('layout-pattern dblclick', layout);

            loadLayout(layout, (data) => {
                var keywordsStr = $(layout).data('keywords');

                //console.debug('overrideLayout', 'loadLayout', data);
                updateLayoutInfo(data.meta);

                var template = data.template;
                var css = data.css;
                var config = data.config;
                if (_lockConfigCode === true) {
                    config = _configJson;
                }

                var configJson = {};
                try {
                    if (typeof config === 'string' || config instanceof String) {
                        configJson = jsonlint.parse(config, null, 4);
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
                $('#configHelpKeywords').html(site.data.strings.editor.config.keywords_help.format(keywords, data.configlink));

                /*
                if ($('#previewTabContent').hasClass('show')) {
                    selectTemplateTab();
                }
                */
                if (!isOnScreen('.main-template-editors-preview-container') || isOnScreen('.main-template-editors-preview-container', 1.0, 0.45)) {
                    $('html, body').animate({
                        scrollTop: $('#sectionEditor').offset().top
                    }, SCROLL_TO_ANIMATION_TIME_MS);
                }
            });
        };

        var previewLayout = function (layout) {
            //console.debug('layout-pattern click', layout);

            loadLayout(layout, (data) => {
                //console.debug('previewLayout', 'loadLayout', data);
                updateLayoutInfo(data.meta);
                generateHTMLFromTemplate(data.template, data.config, data.css, true);
                selectPreviewTab();
            });
        };

        layoutsList.on('updated', () => {
            makeDoubleClick($('.layout-pattern'), overrideLayout, previewLayout);
        });
        makeDoubleClick($('.layout-pattern'), overrideLayout, previewLayout);
    }

    $(document).ready(function () {
        loadFromStorage();

        setTemplateCode(_templateCode);
        setConfigJson(_configJson);
        setCssCode(_cssCode);

        generateLayoutList();

        generateSavedConfigsFromList();
        initSaveConfigControls();

        clearConfigError();
        clearTemplateError();
        clearLayoutInfo();
        $('#templateEditorLinesBadge').hide();
        $('#cssEditorLinesBadge').hide();

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

        var btnPreviewCodeCopySpoiler = new ClipboardJS('#btnPreviewCodeCopySpoiler', {
            text: function (trigger) {
                var code = _codePreview;
                var encoded_code = $('<div />').text(code).html();
                return [
                    '<div class="fr-spoiler">',
                    '<pre><code>',
                    encoded_code,
                    '</pre></code>',
                    '</div>'

                ].join('\n');
            }
        });
        btnPreviewCodeCopySpoiler.on('success', function (e) {
            $('#btnPreviewCodeCopySpoiler').popover('show');
            e.clearSelection();
        });

        var btnPreviewCodeCopySpoilerPreview = new ClipboardJS('#btnPreviewCodeCopySpoilerPreview', {
            text: function (trigger) {
                var code = _codePreview;
                var encoded_code = $('<div />').text(code).html();
                return [
                    '<h2>Code</h2>',
                    '<div class="fr-spoiler">',
                    '<pre><code>',
                    encoded_code,
                    '</pre></code>',
                    '</div>',
                    '',
                    '<h2>Preview</h2>',
                    code,
                ].join('\n');
            }
        });
        btnPreviewCodeCopySpoilerPreview.on('success', function (e) {
            $('#btnPreviewCodeCopySpoilerPreview').popover('show');
            e.clearSelection();
        });

        var btnPreviewCodeCopySpoilerPreviewCredit = new ClipboardJS('#btnPreviewCodeCopySpoilerPreviewCredit', {
            text: function (trigger) {
                var code = _codePreview;
                var encoded_code = $('<div />').text(code).html();
                return [
                    '<p>', $('#msgLayoutPatternInfo').html(), '</p>',
                    '',
                    '<h2>Code</h2>',
                    '<div class="fr-spoiler">',
                    '<pre><code>',
                    encoded_code,
                    '</pre></code>',
                    '</div>',
                    '',
                    '<h2>Preview</h2>',
                    code,
                ].join('\n');
            }
        });
        btnPreviewCodeCopySpoilerPreviewCredit.on('success', function (e) {
            $('#btnPreviewCodeCopySpoilerPreviewCredit').popover('show');
            e.clearSelection();
        });

        $('[data-toggle="popover"]').popover();
        $('.copy-to-clipboard[data-toggle="popover"]').on('shown.bs.popover', function () {
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
                }, SCROLL_TO_ANIMATION_TIME_MS);
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
    });
}());