import { USE_CODEMIRROR, USE_ACE } from './site'
import * as ace from 'ace-builds';
import * as CodeMirror from 'codemirror'

export class PreviewEditor {
    
    private _codePreviewEditor: any = null;
    private _codePreview: string = '';

    constructor() {
    }

    get codePreview() {
        return this._codePreview;
    }
    
    generateCodePreviewEditor() {
        if (USE_ACE) {
            $('#txtPreviewCode').replaceWith('<pre id="txtPreviewCode" class="pre-ace-editor"></pre>');
            this._codePreviewEditor = ace.edit("txtPreviewCode");
            //this._codePreviewEditor.setTheme("ace/theme/dracula");
            this._codePreviewEditor.session.setMode("ace/mode/html");
            this._codePreviewEditor.setReadOnly(true);
        } else if (USE_CODEMIRROR) {
            this._codePreviewEditor = CodeMirror.fromTextArea(document.getElementById('txtPreviewCode') as HTMLTextAreaElement, {
                mode: 'text/html',
                //theme: 'dracula',
                lineNumbers: true,
                readOnly: true
            });
        }
    }

    set codePreview(code: string) {
        this._codePreview = code;
        this._codePreviewEditor.setValue(code);

        if (USE_ACE) {
            this._codePreviewEditor.clearSelection();
        } else if (USE_CODEMIRROR) {
            //setTimeout(function () {
                this._codePreviewEditor.refresh();
            //}, 100);
        }
    }
}