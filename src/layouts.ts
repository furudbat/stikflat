import { site, makeDoubleClick, isOnScreen, USE_CACHE } from './site';
import cache from 'memory-cache';
import parseJson from 'json-parse-better-errors';
import * as jsyaml from 'js-yaml';
import * as jsb from 'js-beautify';
import List from 'list.js';
import { ApplicationData, TEMPLATE_ENGINE_MUSTACHE } from './application.data'
import { ApplicationListener } from './application.listener'
import { LoadedLayoutValue } from './loadedlayout.value';
import { MetaDataValue } from './metadata.value';
import { TemplateValue } from './template.value';

const css_beautify = jsb.css_beautify;
const js_beautify = jsb.js_beautify;

export const SCROLL_TO_ANIMATION_TIME_MS = 600;

const CACHE_LOADED_LAYOUT_MAX_TIME_MS = 2 * 60 * 60 * 1000;

const LAYOUTS_PER_PAGE = 12;

export class Layouts {

    private _layoutsList: List | null = null;
    private _loadedLayouts: cache.CacheClass<string, LoadedLayoutValue> = new cache.Cache<string, LoadedLayoutValue>();

    private _appData: ApplicationData;
    private _appListener: ApplicationListener;

    constructor(appData: ApplicationData, appListener: ApplicationListener) {
        this._appData = appData;
        this._appListener = appListener;
    }

    loadLayout(layout: JQuery<HTMLElement>, callback: (data: LoadedLayoutValue) => void) {
        const id: string | null = ($(layout).attr('data-id'))? $(layout).data('id') : null;
        let layoutLoading = $('#layout-loading-' + id);

        layoutLoading.show();

        let loadedLayout = (id !== null) ? this._loadedLayouts.get(id) : null;
        if (loadedLayout) {
            layoutLoading.hide();
            //console.log('loadLayout from cache', loadedLayout);
            callback(loadedLayout);
        } else {
            var that = this;

            const metalink: string | null = ($(layout).attr('data-meta'))? $(layout).data('meta') : null;
            if (metalink) {
                $.ajax({
                    url: metalink || '',
                    method: "GET",
                    cache: USE_CACHE
                }).done((metaRes) => {
                    const meta: MetaDataValue = jsyaml.load(metaRes);
                    const name = meta.name;

                    const configlink: string | null = ($(layout).attr('data-config'))? $(layout).data('config') : null;
                    const template: string | null = ($(layout).attr('data-template'))? $(layout).data('template') : null;
                    const css: string | null = ($(layout).attr('data-css'))? $(layout).data('css') : null;

                    if (configlink && template && css) {
                        let getConfig = $.ajax({
                            url: configlink || '',
                            method: "GET",
                            cache: USE_CACHE || false
                        });
                        let getTemplate = $.ajax({
                            url: template || '',
                            method: "GET",
                            cache: USE_CACHE || false
                        });
                        let getCSS = $.ajax({
                            url: css || '',
                            method: "GET",
                            cache: USE_CACHE || false
                        });

                        $.when(getTemplate, getConfig, getCSS).done((templateRes, configRes, cssRes) => {
                            const loadedLayout: LoadedLayoutValue = {
                                id: id || '',
                                template: templateRes[0] || '',
                                config: configRes[0] || {},
                                css: cssRes[0] || '',
                                meta: meta,
                                name: name || '',
                                configlink: configlink || '',
                                template_engine: meta.template_engine || TEMPLATE_ENGINE_MUSTACHE
                            };
                            if (id !== null) {
                                that._loadedLayouts.put(id, loadedLayout, CACHE_LOADED_LAYOUT_MAX_TIME_MS);
                            }
                            layoutLoading.hide();
                            //console.log(loadedLayout);
                            callback(loadedLayout);
                        }).fail(function () {
                            layoutLoading.hide();
                        });
                    } else {
                        layoutLoading.hide();
                        console.error('loadLayout', 'configlink, template or are null or empty', { configlink, template, css });
                    }
                }).fail(function () {
                    layoutLoading.hide();
                });
            } else {
                layoutLoading.hide();
                console.error('loadLayout', 'metalink is null or empty');
            }
        }
    }


    generateLayoutList() {
        let templates = [];
        for (const template of site.data.templates as TemplateValue[]) {
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
                keywords: (template.keywords)? template.keywords.join(', ') : '',
                id: template.id,
                preview: preview,
                previewstyle: previewstyle,
                cardbodystyle: cardbodystyle,
                inlinebodystyle: inlinebodystyle,
                inlineauthorstyle: inlineauthorstyle,
                name: template.name,
                layoutloadingid: 'layout-loading-' + template.id,
                type: type,
                author: site.data.strings.layouts.by_author + template.author,
                templateengine: template.template_engine
            });
        }

        const item = `<div class="d-inline colstyle" style="">
            <button type="button" class="btn btn-link card d-inline mr-1 mb-1 layout-pattern style template meta css config keywords id templateengine" 
                style="" data-template="" data-css="" data-config="" data-meta="" data-id="" data-keywords="" data-template-engine="">
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

        const options: any /*List.ListOptions*/ = {
            valueNames: [
                'preview', 'name', 'type', 'author',
                { name: 'template', attr: 'data-template' },
                { name: 'templateengine', attr: 'data-template-engine' },
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
            page: LAYOUTS_PER_PAGE,
            pagination: [{
                paginationClass: "paginationBottom",
                innerWindow: 5,
                left: 2,
                right: 2
            }]
        };

        var that = this;
        this._layoutsList = new List('layouts-list', options, templates);
        this._layoutsList.on('updated', function () {
            makeDoubleClick($('.layout-pattern'), that.overrideLayout.bind(that), that.previewLayout.bind(that));
        });
        makeDoubleClick($('.layout-pattern'), that.overrideLayout.bind(that), that.previewLayout.bind(that));
    }

    clearLayoutInfo() {
        $('#msgLayoutPatternInfo').removeAttr('data-layout-id').hide();
    }

    updateLayoutInfo(id: string | null, meta: MetaDataValue) {
        if (meta === null) {
            console.error('updateLayoutInfo', 'meta is null');
            return;
        }

        const author = meta.author || '&lt;Unknown&gt;';
        const authorLink = meta.author_link || '';
        const description = meta.description || '';
        const link = meta.link || '';
        const name = meta.name || link;
        const license = meta.license || '';
        const more = meta.more || '';

        //console.log('updateLayoutInfo', {id, author, authorLink, link, name, license, more, meta});

        let header = (link === '') ? name : '<a href="' + link + '" target="_blank">' + name + '</a>';
        header += site.data.strings.info.by_author + '<a href="' + authorLink + '" target="_blank">' + author + '</a>';

        $('#msgLayoutPatternInfoHeader').html(header);
        $('#msgLayoutPatternInfoDescription').html(description);
        $('#msgLayoutPatternInfoLicense').html(license);
        $('#msgLayoutPatternInfoMore').html(more);
        $('#msgLayoutPatternInfo').data('layout-id', id).show();

        this._appData.currentLayoutId = id;
    }

    reloadLayoutInfo(id: string) {
        var that = this;
        this.loadLayout($('.layout-pattern[data-id="' + id + '"]').first(), function (data) {
            console.log('reloadLayoutInfo', 'loadLayout', data);
            that.updateLayoutInfo(id, data.meta);
        });
    };

    private overrideLayout(layout: JQuery<HTMLElement>) {
        //console.debug('layout-pattern dblclick', layout);

        var that = this;
        this.loadLayout(layout, function (data) {
            const id: string | null = ($(layout).attr('data-id'))? $(layout).data('id') : null;
            const keywordsStr: string = ($(layout).attr('data-keywords'))? $(layout).data('keywords') : '';

            //console.debug('overrideLayout', 'loadLayout', data);
            that.updateLayoutInfo(id, data.meta);

            const template: string = data.template;
            const css: string = data.css;
            const config = (that._appData.isLockConfig) ? that._appData.configJson : data.config;

            let configJson: unknown = {};
            try {
                if (typeof config === 'string' || config instanceof String) {
                    configJson = js_beautify(parseJson(config as string));
                } else {
                    configJson = config;
                }
            } catch (e) {
                console.error(e);
            }

            //console.log('overrideLayout', {id, template, configJson, css});
            if (id) {
                that._appData.currentLayoutId = id;
            }
            that._appData.templateCode = template;
            that._appData.configJson = configJson;
            that._appData.cssCode = css_beautify(css);
            that._appData.updateConfigCodesStr();

            that._appListener.initEditors();
            that._appListener.generateHTML();

            const keywordsArr = keywordsStr.split(", ").map(Function.prototype.call, String.prototype.trim);
            const keywords = keywordsArr.map(it => `<code>${it}</code>`).join(', ');
            $('#configHelpKeywords').html(site.data.strings.editor.config.keywords_help.format(keywords, data.configlink));

            /*
            if ($('#previewTabContent').hasClass('show')) {
                selectTemplateTab();
            }
            */
            if (!isOnScreen('.main-template-editors-preview-container') || isOnScreen('.main-template-editors-preview-container', 1.0, 0.45)) {
                const sectionEditorOffset = $('#sectionEditor').offset() || null;
                if (sectionEditorOffset) {
                    $('html, body').animate({
                        scrollTop: sectionEditorOffset.top
                    }, SCROLL_TO_ANIMATION_TIME_MS);
                }
            }
        });
    };

    private previewLayout(layout: JQuery<HTMLElement>) {
        //console.debug('layout-pattern click', layout);

        var that = this;
        this.loadLayout(layout, function (data) {
            //console.debug('previewLayout', 'loadLayout', data);
            that.updateLayoutInfo(data.id, data.meta);
            that._appListener.generateHTMLFromTemplate(data.template_engine, data.template, data.config, data.css, true);
            that._appListener.selectPreviewTab();
            that._appData.currentLayoutId = data.id;
        });
    };
}