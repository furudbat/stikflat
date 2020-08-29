import { site, countlines } from './site'
import ace from 'brace';
import 'brace/ext/beautify'
import 'brace/ext/textarea'
import 'brace/ext/error_marker'
import 'brace/mode/css';
import 'brace/worker/css'
import 'brace/theme/dracula';
import { ApplicationData } from './application.data'
import { ApplicationListener } from './application.listener';

export class CssEditor {

    private _cssEditor: ace.Editor | null = null;

    private _appData: ApplicationData;
    private _appListener: ApplicationListener;

    constructor(appData: ApplicationData, appListener: ApplicationListener){
        this._appData = appData;
        this._appListener = appListener;
    }

    generateCssEditor() {
        $('#txtCSS').replaceWith('<pre id="txtCSS" class="pre-ace-editor"></pre>');
        this._cssEditor = ace.edit("txtCSS");
        //_cssEditor.setTheme("ace/theme/dracula");
        this._cssEditor.session.setMode("ace/mode/json");

        var that = this;
        this._cssEditor.session.on('change', function (delta: any) {
            // delta.start, delta.end, delta.lines, delta.action
            that.onChangeCSS((that._cssEditor)? that._cssEditor.getValue() : '');
        });
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
    }

    initEditor() {
        const cssCode = this._appData.cssCode;

        this.updateCssLinesOfCodeBadges(cssCode);
        if (this._cssEditor) {
            this._cssEditor.setValue(cssCode);
            this._cssEditor.clearSelection();
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