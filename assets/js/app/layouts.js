/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify, jsyaml, List */
/*global site */

const SCROLL_TO_ANIMATION_TIME_MS = 600;

export class Layouts {
    
    loadLayout(layout, callback) {
        let id = $(layout).data('id');
        let layoutLoading = $('#layout-loading-' + id);
        layoutLoading.show();
        $.ajax({
            url: $(layout).data('meta'),
            method: "GET",
            cache: USE_CACHE
        }).done((metaRes) => {
            let meta = jsyaml.load(metaRes);
            let name = meta.name;
            let configlink = $(layout).data('config');

            let getConfig = $.ajax({
                url: configlink,
                method: "GET",
                cache: USE_CACHE
            });
            let getTemplate = $.ajax({
                url: $(layout).data('template'),
                method: "GET",
                cache: USE_CACHE
            });
            let getCSS = $.ajax({
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
    

    generateLayoutList() {
        let templates = [];
        for (const template of site.data.templates) {
            if (('disable' in template && template.disable == true) || ('disabled' in template && template.disabled == true)) {
                continue;
            }

            let type = '';
            if (template.type == 'character') {
                type = '<span  class="badge badge-pill badge-success">' + site.data.strings.layouts.type_character + '</span>';
            } else if (template.type == 'user') {
                type = '<span class="badge badge-pill badge-warning">' + site.data.strings.layouts.type_user + '</span>';
            } else if (template.type == 'codesnippet') {
                type = '<span class="badge badge-pill badge-info">' + site.data.strings.layouts.type_codesnippet + '</span>';
            } else {
                type = '<span class="badge badge-pill badge-danger">' + template.type + '</span>';
            }

            let style = template.style;
            let preview = '';
            let previewstyle = '';
            let cardbodystyle = '';
            let inlinebodystyle = '';
            let inlineauthorstyle = '';
            let colstyle = '';
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

        let item = `<div class="d-inline colstyle" style="">
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

        let options = {
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
        
        this.layoutsList = new List('layouts-list', options, templates);

        var that = this;
        var overrideLayout = function (layout) {
            //console.debug('layout-pattern dblclick', layout);

            that.loadLayout(layout, (data) => {
                let keywordsStr = $(layout).data('keywords');

                //console.debug('overrideLayout', 'loadLayout', data);
                updateLayoutInfo(data.meta);

                let template = data.template;
                let css = data.css;
                let config = data.config;
                if (_lockConfigCode === true) {
                    config = _configJson;
                }

                let configJson = {};
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

                let keywordsArr = keywordsStr.split(", ").map(Function.prototype.call, String.prototype.trim);
                let keywords = keywordsArr.map(it => `<code>${it}</code>`).join(', ');
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

        this.layoutsList.on('updated', () => {
            makeDoubleClick($('.layout-pattern'), overrideLayout, previewLayout);
        });
        makeDoubleClick($('.layout-pattern'), overrideLayout, previewLayout);
    }
}