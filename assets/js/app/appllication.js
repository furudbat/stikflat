/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify, jsyaml, jsonlint */
/*global site, WITH_WYSIWYG_EDITOR */
'use strict';

export class Application {

    

    clearLayoutInfo() {
        $('#msgLayoutPatternInfo').hide();
    }
    updateLayoutInfo(meta) {
        if (meta === null) {
            console.error('updateLayoutInfo', 'meta is null');
            return;
        }
        this._currentLayoutId = meta.id;

        let author = meta.author || '&lt;Unknown&gt;';
        let authorLink = meta.author_link || '';
        let description = meta.description || '';
        let link = meta.link || '';
        let name = meta.name || link;
        let license = meta.license || '';
        let more = meta.more || '';

        let header = (link === '')? name : '<a href="' + link + '" target="_blank">' + name + '</a>';
        header += site.data.strings.info.by_author + '<a href="' + authorLink + '" target="_blank">' + author + '</a>';

        $('#msgLayoutPatternInfoHeader').html(header);
        $('#msgLayoutPatternInfoDescription').html(description);
        $('#msgLayoutPatternInfoLicense').html(license);
        $('#msgLayoutPatternInfoMore').html(more);
        $('#msgLayoutPatternInfo').show();
    }

    initEditors(){

    }
    



    generateHTMLFromTemplate(template, json, css, onlypreview = false) {
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


    generateHTML() {
        let template = getTemplateCode();
        let json = getConfigCodeJSON();
        let css = getCssCode();

        generateHTMLFromTemplate(template, json, css);
    }

    changeConfigMode(mode) {
        updateConfigCodesStr();
        setCodeContentMode(mode);
        initEditor();
    }

    selectPreviewTab() {
        $('#templateTabs a[href="#previewTabContent"]').tab('show');
    }
    selectTemplateTab() {
        $('#templateTabs a[href="#templateTabContent"]').tab('show');

        if (USE_CODEMIRROR) {
            //setTimeout(function () {
            _templateEditor.refresh();
            //}, 100);
        }
    }
    selectCssTab() {
        $('#templateTabs a[href="#cssTabContent"]').tab('show');

        if (USE_CODEMIRROR) {
            //setTimeout(function () {
            _cssEditor.refresh();
            //}, 100);
        }
    }

    init(){
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
    }
}