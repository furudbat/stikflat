/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify */
(function () {
    'use strict';

    const STORAGE_AVAILABLE = typeof (Storage) !== 'undefined';
    const STORAGE_KEY_TEMPLATE_CODE = 'template_code';
    const STORAGE_KEY_CONFIG_CODE = 'config_code';
    const STORAGE_KEY_CSS_CODE = 'css_code';
    const STORAGE_KEY_LOCK_CONFIG_CODE = 'lock_config_code';
    const STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR = 'enable_WYSIWYG_template_editor';
    const STORAGE_KEY_ENABLE_LIVE_PREVIEW = 'enable_live_preview';

    const TEMPLATE_EDITOR_NAME_CODEMIRROR = 'CodeMirror';
    const TEMPLATE_EDITOR_NAME_TINYMCE = 'TinyMCE';
    const TEMPLATE_EDITOR_NAME_FROALAEDITOR = 'FroalaEditor';

    var _templateEditor = null;
    var _templateWYSIWYGEditor = null;
    var _configEditor = null;
    var _cssEditor = null;
    var _codePreviewEditor = null;

    var _templateCode = '';
    var _configJson = {};
    var _cssCode = '';
    var _codePreview = '';
    var _currentPattern = '';
    var _lockConfigCode = false;
    var _enableWYSIWYGTemplateEditor = false;
    var _enableLivePreview = true;
    var _currentTemplateEditorName = '';
    var _currentWYSIWYGTemplateEditorName = '';

    function loadFromStorage() {
        if (STORAGE_AVAILABLE == true) {
            _templateCode = localStorage.getItem(STORAGE_KEY_TEMPLATE_CODE) || _templateCode;
            try {
                _configJson = $.parseJSON(localStorage.getItem(STORAGE_KEY_CONFIG_CODE)) || _configJson;
            } catch (e) {
                console.error({ loadFromStorage: 'parse CONFIG_CODE', e });
                _configJson = {};
            }
            _cssCode = localStorage.getItem(STORAGE_KEY_CSS_CODE) || _cssCode;
            _lockConfigCode = localStorage.getItem(STORAGE_KEY_LOCK_CONFIG_CODE) == 'true' || _lockConfigCode;
            _enableWYSIWYGTemplateEditor = localStorage.getItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR) == 'true' || _enableWYSIWYGTemplateEditor;
            _enableLivePreview = localStorage.getItem(STORAGE_KEY_ENABLE_LIVE_PREVIEW) == 'true' || _enableLivePreview;

            console.debug('loadFromStorage', { _templateCode, _configJson, _cssCode, _lockConfigCode, _enableWYSIWYGTemplateEditor, _enableLivePreview });
        } else {
            console.log('no local storage available');
        }
    }

    function clearStorage() {
        if (STORAGE_AVAILABLE == true) {
            localStorage.removeItem(STORAGE_KEY_TEMPLATE_CODE);
            localStorage.removeItem(STORAGE_KEY_CONFIG_CODE);
            localStorage.removeItem(STORAGE_KEY_CSS_CODE);
            localStorage.removeItem(STORAGE_KEY_LOCK_CONFIG_CODE);
            localStorage.removeItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR);
            localStorage.removeItem(STORAGE_KEY_ENABLE_LIVE_PREVIEW);
        }
    }

    function getTemplateCode() {
        return _templateCode;
    }
    function getConfigCode() {
        return JSON.stringify(_configJson, null, 4);
    }
    function getCssCode() {
        return _cssCode;
    }

    function setTemplateCode(code) {
        _templateCode = code;
        localStorage.setItem(STORAGE_KEY_TEMPLATE_CODE, code);
    }
    function setConfigJson(json) {
        _configJson = json;
        localStorage.setItem(STORAGE_KEY_CONFIG_CODE, JSON.stringify(json));
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

    function generateHTMLFromTemplate(template, json, css, onlypreview = false) {
        if (typeof json === 'string' || json instanceof String) {
            clearConfigError();
            try {
                if (json != '') {
                    json = JSON.parse(json);
                }
            } catch (error) {
                json = {};
                var html = error.toString();
                if (onlypreview == true) {
                    setHTMLPreview(html, css);
                } else {
                    setConfigError(html);
                }
            }
        }

        if (json != null) {
            clearTemplateError();
            try {
                var htmlstr = Mustache.render(template, json);
                setHTMLPreview(htmlstr, css);
                if (onlypreview == false) {
                    setCodePreview(html_beautify(htmlstr));
                }
            } catch (error) {
                console.error(error);

                if (onlypreview == true) {
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
        var json = getConfigCode();
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
                        if (_enableLivePreview == true) {
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
                        if (_enableLivePreview == true) {
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
            if (_enableLivePreview == true) {
                generateHTML();
            }
        });
        _currentTemplateEditorName = TEMPLATE_EDITOR_NAME_CODEMIRROR;
    }

    function generateConfigEditor() {
        _configEditor = CodeMirror.fromTextArea(document.getElementById('txtConfig'), {
            value: getConfigCode(),
            mode: 'application/json',
            //theme: 'dracula',
            lineNumbers: true,
            linter: true,
            spellcheck: true,
            autoRefresh: true
        });
        _configEditor.on('changes', function (cm, changes) {
            var jsonstring = cm.getValue();
            try {
                if (jsonstring != '') {
                    setConfigJson($.parseJSON(jsonstring));
                    if (_enableLivePreview == true) {
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
            if (_enableLivePreview == true) {
                generateHTML();
            }
        });
    }

    function generateCodePreviewEditor() {
        _codePreviewEditor = CodeMirror.fromTextArea(document.getElementById('preview-code'), {
            mode: 'text/html',
            //theme: 'dracula',
            lineNumbers: true,
            readOnly: true,
            autoRefresh: true
        });
    }

    function setTemplateEditorValue(code) {
        if (WITH_WYSIWYG_EDITOR == true) {
            if (_currentWYSIWYGTemplateEditorName == TEMPLATE_EDITOR_NAME_TINYMCE) {
                _templateWYSIWYGEditor.setContent(code);
            } else if (_currentWYSIWYGTemplateEditorName == TEMPLATE_EDITOR_NAME_FROALAEDITOR) {
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
        _configEditor.setValue(getConfigCode());

        setTimeout(function () {
            _cssEditor.refresh();
            _configEditor.refresh();
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
    }
    function clearConfigError() {
        $('#configError').hide().empty();
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
        var name = $(pattern).data('name');
        var author = $(pattern).data('author');
        var authorLink = $(pattern).data('author-link');
        var description = $(pattern).data('description');
        var link = $(pattern).data('link');
        var license = $(pattern).data('license');

        var header = '<p class="text-bold">';
        header += name + site.data.strings.layouts.by_author + '<a href="' + authorLink + '" target="_blank">' + author + '</a>';
        if (link != '') {
            header += ' - ' + '<a href="' + link + '" target="_blank">' + link + '</a>';
        }
        header += '</p>';

        $('#msgLayoutPatternInfo').empty()
            .append(header)
            .append('<p class="text-justify">' + description + '</p>')
            .append('<p class="font-italic">' + license + '</p>')
            .show();
    }

    $(document).ready(function () {
        loadFromStorage();

        setTemplateCode(_templateCode);
        setConfigJson(_configJson);
        setCssCode(_cssCode);

        clearConfigError();
        clearTemplateError();
        clearLayoutInfo();

        generateTemplateEditor();
        if (WITH_WYSIWYG_EDITOR == true) {
            generateTemplateWYSIWYGEditor();
        }
        generateConfigEditor();
        generateCssEditor();
        generateCodePreviewEditor();

        initEditors();
        generateHTML();


        if (_lockConfigCode == true) {
            $('#chbLockConfig').bootstrapToggle('on');
            lockConfig();
        } else {
            $('#chbLockConfig').bootstrapToggle('off');
            unlockConfig();
        }
        if (_enableLivePreview == true) {
            $('#chbLivePreview').prop('checked', true);
            enableLivePreview();
        } else {
            $('#chbLivePreview').prop('checked', false);
            disableLivePreview();
        }
        if (WITH_WYSIWYG_EDITOR == true) {
            if (_enableWYSIWYGTemplateEditor == true) {
                enableWYSIWYGEditor();
            } else {
                disableWYSIWYGEditor();
            }
        } else {
            disableWYSIWYGEditor();
        }

        /*
        if (getTemplateCode() == '') {
            selectPreviewTab();
        } else {
            selectTemplateTab();
        }
        */
        $('#collapseConfig').collapse('show');

        $('#templateTabs a[href="#previewTabContent"]').on('click', function (e) {
            selectPreviewTab();
        });
        $('#templateTabs a[href="#templateTabContent"]').on('click', function (e) {
            selectTemplateTab();
        });
        $('#templateTabs a[href="#cssTabContent"]').on('click', function (e) {
            selectCssTab();
        });

        if (WITH_WYSIWYG_EDITOR == true) {
            $('#btnEnableWYSIWYGEditor').click(function () {
                enableWYSIWYGTemplateEditor = !_enableWYSIWYGTemplateEditor;
                if (_enableWYSIWYGTemplateEditor == true) {
                    enableWYSIWYGEditor();
                } else {
                    disableWYSIWYGEditor();
                }
            });
        }

        $('#chbLivePreview').change(function () {
            var checked = $(this).prop('checked');
            if (checked == true) {
                enableLivePreview();
            } else {
                disableLivePreview();
            }
        });
        $('#chbLockConfig').change(function () {
            var checked = $(this).prop('checked');
            if (checked == true) {
                lockConfig();
            } else {
                unlockConfig();
            }
        });
        $('.generate-btn').click(function () {
            generateHTML();
        });
        $('#btnClearStorage').click(function () {
            clearStorage();
        });

        $('#collapseConfig').on('shown.bs.collapse', function () {
            $('#btnCollapseConfig').html(site.data.strings.editor.config.header).attr('class', 'btn btn-primary');

            $('.main-config-editors-container').removeClass(function (index, className) {
                return (className.match(/(^|\s)col-\S+/g) || []).join(' ');
            }).addClass('col-md-4');
            $('.main-template-editors-container').removeClass(function (index, className) {
                return (className.match(/(^|\s)col-\S+/g) || []).join(' ');
            }).addClass('col-md-8');
        });
        $('#collapseConfig').on('hidden.bs.collapse', function () {
            $('#btnCollapseConfig').html(site.data.strings.editor.config.header_short).attr('class', 'btn btn-secondary');

            $('.main-config-editors-container').removeClass(function (index, className) {
                return (className.match(/(^|\s)col-\S+/g) || []).join(' ');
            }).addClass('col-md-2');
            $('.main-template-editors-container').removeClass(function (index, className) {
                return (className.match(/(^|\s)col-\S+/g) || []).join(' ');
            }).addClass('col-md-10');
        });

        var overrideLayout = function (layout) {
            console.debug('layout-pattern dblclick', layout);

            var name = $(layout).data('name');
            var getTemplate = $.get($(layout).data('template'));
            var getConfig = $.get($(layout).data('config'));
            var getCSS = $.get($(layout).data('css'));

            $.when(getTemplate, getConfig, getCSS).done((templateRes, configRes, cssRes) => {
                _currentPattern = name;
                var template = templateRes[0];
                var css = cssRes[0];

                var config = configRes[0];
                if (_lockConfigCode == true) {
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
                setCssCode(css_beautify(css));

                initEditors();
                generateHTML();
                /*
                if ($('#previewTabContent').hasClass('show')) {
                    selectTemplateTab();
                }
                */
            });
            updateLayoutInfo(layout);
        };

        var previewLayout = function (layout) {
            console.debug('layout-pattern click', layout);

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
        makeDoubleClick($('.layout-pattern'), overrideLayout, previewLayout);
    });
}());