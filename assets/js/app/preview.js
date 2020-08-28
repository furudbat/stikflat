/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify */
'use strict';

export class Preview {

    enableLivePreview() {
        _enableLivePreview = true;
        localStorage.setItem(STORAGE_KEY_ENABLE_LIVE_PREVIEW, _enableLivePreview);
        $('#chbLivePreviewHelp').html(site.data.strings.editor.template.enabled_live_preview_help);
    }
    disableLivePreview() {
        _enableLivePreview = false;
        localStorage.setItem(STORAGE_KEY_ENABLE_LIVE_PREVIEW, _enableLivePreview);
        $('#chbLivePreviewHelp').html(site.data.strings.editor.template.disabled_live_preview_help);
    }

    setHTMLPreview(htmlstr, css) {
        let html = $.parseHTML('<style>' + css + '</style>' + htmlstr);
        $('#preview-html').html(html);
    }
}