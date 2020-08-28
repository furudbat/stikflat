/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, ace, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify */
/*global USE_ACE, USE_CODEMIRROR */
'use strict';

export class PreviewEditor {
    
    constructor() {
        this._codePreviewEditor = null;
    }
    
    generateCodePreviewEditor() {
        if (USE_ACE) {
            $('#txtPreviewCode').replaceWith('<pre id="txtPreviewCode" class="pre-ace-editor"></pre>');
            this._codePreviewEditor = ace.edit("txtPreviewCode");
            //this._codePreviewEditor.setTheme("ace/theme/dracula");
            this._codePreviewEditor.session.setMode("ace/mode/html");
            this._codePreviewEditor.setReadOnly(true);
        }
        if (USE_CODEMIRROR) {
            this._codePreviewEditor = CodeMirror.fromTextArea(document.getElementById('txtPreviewCode'), {
                mode: 'text/html',
                //theme: 'dracula',
                lineNumbers: true,
                readOnly: true,
                autoRefresh: true
            });
        }
    }

    setCodePreview(code) {
        _codePreview = code;
        this._codePreviewEditor.setValue(code);

        if (USE_ACE) {
            this._codePreviewEditor.clearSelection();
        }

        if (USE_CODEMIRROR) {
            //setTimeout(function () {
                this._codePreviewEditor.refresh();
            //}, 100);
        }
    }
}