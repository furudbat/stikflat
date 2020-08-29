import ace from 'brace';
import 'brace/ext/beautify'
import 'brace/ext/textarea'
import 'brace/ext/error_marker'
import 'brace/mode/html';
import 'brace/worker/html'
import 'brace/theme/dracula';

export class PreviewEditor {
    
    private _codePreviewEditor: ace.Editor | null = null;
    private _codePreview: string = '';

    constructor() {
    }

    get codePreview() {
        return this._codePreview;
    }
    
    generateCodePreviewEditor() {
        $('#txtPreviewCode').replaceWith('<pre id="txtPreviewCode" class="pre-ace-editor"></pre>');
        this._codePreviewEditor = ace.edit('txtPreviewCode');
        this._codePreviewEditor.setTheme('ace/theme/dracula');
        this._codePreviewEditor.session.setMode('ace/mode/html');
        this._codePreviewEditor.setReadOnly(true);
        this._codePreviewEditor.setShowPrintMargin(false);
    }

    set codePreview(code: string) {
        this._codePreview = code;
        if (this._codePreviewEditor) {
            this._codePreviewEditor.setValue(code);
            this._codePreviewEditor.clearSelection();
        }
    }
}