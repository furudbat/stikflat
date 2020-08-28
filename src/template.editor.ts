import { site, countlines, USE_CODEMIRROR, USE_ACE, USE_FROLALA_EDITOR, WITH_WYSIWYG_EDITOR } from './site'
declare var FroalaEditor: any;
import * as ace from 'ace-builds';
import * as CodeMirror from 'codemirror'
import * as tinymce from 'tinymce'
import { ApplicationData } from './application.data'
import { ApplicationListener } from './application.listener';

const TEMPLATE_EDITOR_NAME_CODEMIRROR = 'CodeMirror';
const TEMPLATE_EDITOR_NAME_TINYMCE = 'TinyMCE';
const TEMPLATE_EDITOR_NAME_FROALAEDITOR = 'FroalaEditor';
const TEMPLATE_EDITOR_NAME_ACE = 'ace';

export class TemplateEditor {
    
    private _templateEditor: any = null;
    private _templateWYSIWYGEditor: any = null;
    private _currentWYSIWYGTemplateEditorName: string = '';
    private _currentTemplateEditorName: string = '';

    private _appData: ApplicationData;
    private _appListener: ApplicationListener;

    constructor(appData: ApplicationData, appListener: ApplicationListener){
        this._appData = appData;
        this._appListener = appListener;
    }
    
    set templateError(error: string) {
        $('#configError').html(error).show();
    }
    clearTemplateError() {
        $('#templateError').hide().empty();
    }

    updateTemplateLinesOfCodeBadges(code: string) {
        let loc = countlines(code);
        if (loc > 0) {
            $('#templateEditorLinesBadge').html(site.data.strings.editor.lines.format(loc)).show();
        } else {
            $('#templateEditorLinesBadge').hide();
        }
    }

    generateTemplateWYSIWYGEditor() {
        var that = this;
        var onChangeTemplate = function (value: string) {
            that._appData.templateCode = value;
            that.updateTemplateLinesOfCodeBadges(value);
            if (that._appData.isLivePreviewEnabled) {
                that._appListener.generateHTML();
            }
        };
        if (USE_FROLALA_EDITOR) {
            this._templateWYSIWYGEditor = new FroalaEditor('#txtTemplateWYSIWYG', {
                theme: 'dark',
                iconsTemplate: 'font_awesome_5',
                heightMin: 300,
                toolbarButtons: [
                    'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'specialCharacters', '|', 'textColor', 'emoticons', '|', 'paragraphFormat',
                    'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote',
                    'inlineClass', 'fontAwesome', 'spellChecker',
                    'insertLink', 'insertImage', 'insertTable', 'undo', 'redo', 'clearFormating', 'html', 'fullscreen',
                    'help'
                ],
                events: {
                    contentsChanged: function (e: any, editor: any) {
                        onChangeTemplate(editor.html.get());
                    }
                }
            });
            this._templateWYSIWYGEditor.html.set(that._appData.templateCode);
            this._currentWYSIWYGTemplateEditorName = TEMPLATE_EDITOR_NAME_FROALAEDITOR;
        } else {
            tinymce.init({
                selector: '#txtTemplateWYSIWYG',
                height: 500,
                menubar: false,
                skin: 'oxide-dark',
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                ],
                toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                setup: function (editor) {
                    editor.on('change', function (e) {
                        onChangeTemplate(editor.getContent());
                    });
                }
            });
            this._templateWYSIWYGEditor = tinymce.get('txtTemplateWYSIWYG');
            this._templateWYSIWYGEditor.setContent(this._appData.templateCode);
            this._currentWYSIWYGTemplateEditorName = TEMPLATE_EDITOR_NAME_TINYMCE;
        }
    }

    generateTemplateEditor() {
        var that = this;
        var onChangeTemplateEditor = function (value: string) {
            that._appData.templateCode = value;
            that.updateTemplateLinesOfCodeBadges(value);
            if (that._appData.isLivePreviewEnabled) {
                that._appListener.generateHTML();
            }
        };

        if (USE_ACE) {
            $('#txtTemplate').replaceWith('<pre id="txtTemplate" class="pre-ace-editor"></pre>');
            this._templateEditor = ace.edit("txtTemplate");
            //_templateEditor.setTheme("ace/theme/dracula");
            this._templateEditor.session.setMode("ace/mode/html");
            this._templateEditor.session.on('change', function (delta: any) {
                // delta.start, delta.end, delta.lines, delta.action
                onChangeTemplateEditor(that._templateEditor.getValue());
            });
            this._currentTemplateEditorName = TEMPLATE_EDITOR_NAME_ACE;
        }

        if (USE_CODEMIRROR) {
            this._templateEditor = CodeMirror.fromTextArea(document.getElementById('txtTemplate') as HTMLTextAreaElement, {
                value: this._appData.templateCode,
                mode: 'text/html',
                //theme: 'dracula',
                lineNumbers: true,
                lint: true,
                gutters: ["CodeMirror-lint-markers"],
                extraKeys: { "Ctrl-Space": "autocomplete" }
            });
            this._templateEditor.on('changes', function (cm: any, changes: any) {
                onChangeTemplateEditor(cm.getValue());
            });
            this._currentTemplateEditorName = TEMPLATE_EDITOR_NAME_CODEMIRROR;
        }
    }

    setTemplateEditorValue(code: string) {
        if (WITH_WYSIWYG_EDITOR === true) {
            if (this._currentWYSIWYGTemplateEditorName === TEMPLATE_EDITOR_NAME_TINYMCE) {
                this._templateWYSIWYGEditor.setContent(code);
            } else if (this._currentWYSIWYGTemplateEditorName === TEMPLATE_EDITOR_NAME_FROALAEDITOR) {
                this._templateWYSIWYGEditor.html.set(code);
            }
        }

        this._templateEditor.setValue(code);
        this.updateTemplateLinesOfCodeBadges(code);

        if (USE_ACE) {
            this._templateEditor.clearSelection();
        }
        if (USE_CODEMIRROR) {
            //setTimeout(function () {
                this._templateEditor.refresh();
            //}, 100);
        }
    }
    
    initEditor() {
        const templateCode = this._appData.templateCode;
        this.setTemplateEditorValue(templateCode);
        this.updateTemplateLinesOfCodeBadges(templateCode);
    }

    refresh() {
        if (USE_CODEMIRROR) {
            //setTimeout(function () {
            this._templateEditor.refresh();
            //}, 100);
        }
    }
    
    enableWYSIWYGEditor() {
        this._appData.enableWYSIWYGEditor();
        this.initEditor();

        $('.main-template-editors-editor-container').hide();
        $('.main-template-editors-WYSIWYG-editor-container').show();
        $('#btnEnableWYSIWYGEditor').html(site.data.strings.editor.template.enabled_WYSIWYG_editor_btn).attr('class', 'btn btn-secondary');
    }
    disableWYSIWYGEditor() {
        this._appData.disableWYSIWYGEditor();
        this.initEditor();

        $('.main-template-editors-editor-container').show();
        $('.main-template-editors-WYSIWYG-editor-container').hide();
        $('#btnEnableWYSIWYGEditor').html(site.data.strings.editor.template.disabled_WYSIWYG_editor_btn).attr('class', 'btn btn-outline-secondary');
    }
}