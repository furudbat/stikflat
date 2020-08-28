/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, ace, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify */
/*global site, countlines, USE_ACE, USE_CODEMIRROR */
'use strict';

export class PreviewEditor {
    
    constructor() {
        this._cssEditor = null;
    }
    
    generateCssEditor() {
        var that = this;
        var onChangeCSS = function (value) {
            setCssCode(value);
            that.updateCssLinesOfCodeBadges(value);
            if (_enableLivePreview === true) {
                generateHTML();
            }
        };
        if (USE_ACE) {
            $('#txtCSS').replaceWith('<pre id="txtCSS" class="pre-ace-editor"></pre>');
            this._cssEditor = ace.edit("txtCSS");
            //_cssEditor.setTheme("ace/theme/dracula");
            this._cssEditor.session.setMode("ace/mode/json");
            this._cssEditor.session.on('change', function (delta) {
                // delta.start, delta.end, delta.lines, delta.action
                onChangeCSS(that._cssEditor.getValue());
            });
        }
        if (USE_CODEMIRROR) {
            this._cssEditor = CodeMirror.fromTextArea(document.getElementById('txtCSS'), {
                value: getCssCode(),
                mode: 'text/css',
                //theme: 'dracula',
                //lineNumbers: true,
                linter: true,
                autoRefresh: true
            });
            this._cssEditor.on('changes', function (cm, changes) {
                onChangeCSS(cm.getValue());
            });
        }
    }

    updateCssLinesOfCodeBadges(code) {
        let loc = countlines(code);
        if (loc > 0) {
            $('#cssEditorLinesBadge').html(site.data.strings.editor.lines.format(loc)).show();
        } else {
            $('#cssEditorLinesBadge').hide();
        }
    }

    refresh(){
        if (USE_CODEMIRROR) {
            //setTimeout(function () {
            this._cssEditor.refresh();
            //}, 100);
        }
    }
    
    initEditors() {
        let cssCode = getCssCode();

        this._cssEditor.setValue(cssCode);
        this.updateCssLinesOfCodeBadges(cssCode);

        if (USE_ACE) {
            this._cssEditor.clearSelection();
        } else if (USE_CODEMIRROR) {
            //setTimeout(function () {
            this._cssEditor.refresh();
            //}, 100);
        }
    }
}