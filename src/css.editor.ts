import { site, countlines, USE_CODEMIRROR, USE_ACE } from './site'
import * as ace from 'ace-builds';
import * as CodeMirror from 'codemirror'
import { ApplicationData } from './application.data'
import { ApplicationListener } from './application.listener';

export class CssEditor {

    private _cssEditor: any = null;

    private _appData: ApplicationData;
    private _appListener: ApplicationListener;

    constructor(appData: ApplicationData, appListener: ApplicationListener){
        this._appData = appData;
        this._appListener = appListener;
    }

    generateCssEditor() {
        var that = this;
        if (USE_ACE) {
            $('#txtCSS').replaceWith('<pre id="txtCSS" class="pre-ace-editor"></pre>');
            this._cssEditor = ace.edit("txtCSS");
            //_cssEditor.setTheme("ace/theme/dracula");
            this._cssEditor.session.setMode("ace/mode/json");
            this._cssEditor.session.on('change', function (delta: any) {
                // delta.start, delta.end, delta.lines, delta.action
                that.onChangeCSS(that._cssEditor.getValue());
            });
        } else if (USE_CODEMIRROR) {
            this._cssEditor = CodeMirror.fromTextArea(document.getElementById('txtCSS') as HTMLTextAreaElement, {
                value: this._appData.cssCode,
                mode: 'text/css',
                //theme: 'dracula',
                //lineNumbers: true,
                lint: true,
            });
            this._cssEditor.on('changes', function (cm: any, changes: any) {
                that.onChangeCSS(cm.getValue());
            });
        }
    }

    updateCssLinesOfCodeBadges(code: string) {
        const loc = countlines(code);
        if (loc > 0) {
            $('#cssEditorLinesBadge').html(site.data.strings.editor.lines.format(loc)).show();
        } else {
            $('#cssEditorLinesBadge').hide();
        }
    }

    refresh() {
        if (USE_CODEMIRROR) {
            //setTimeout(function () {
            this._cssEditor.refresh();
            //}, 100);
        }
    }

    initEditor() {
        const cssCode = this._appData.cssCode;

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

    private onChangeCSS(value: string) {
        this._appData.cssCode = value;
        this.updateCssLinesOfCodeBadges(value);
        if (this._appData.isLivePreviewEnabled) {
            this._appListener.generateHTML();
        }
    };
}