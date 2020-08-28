/*global localStorage, console, $, CodeMirrorSpellChecker, CodeMirror, FroalaEditor, setTimeout, document, Mustache, html_beautify, js_beautify, css_beautify, tinymce */
/*global site, countlines, USE_FROLALA_EDITOR, USE_ACE, USE_CODEMIRROR, WITH_WYSIWYG_EDITOR */
"use strict";

const TEMPLATE_EDITOR_NAME_CODEMIRROR = 'CodeMirror';
const TEMPLATE_EDITOR_NAME_TINYMCE = 'TinyMCE';
const TEMPLATE_EDITOR_NAME_FROALAEDITOR = 'FroalaEditor';
const TEMPLATE_EDITOR_NAME_ACE = 'ace';

export class TemplateEditor {
    
    constructor() {
        this._templateEditor = null;
        this._templateWYSIWYGEditor = null;
        this._currentWYSIWYGTemplateEditorName = '';
    }
    
    setTemplateError(error) {
        $('#configError').html(error).show();
    }
    clearTemplateError() {
        $('#templateError').hide().empty();
    }

    updateTemplateLinesOfCodeBadges(code) {
        var loc = countlines(code);
        if (loc > 0) {
            $('#templateEditorLinesBadge').html(site.data.strings.editor.lines.format(loc)).show();
        } else {
            $('#templateEditorLinesBadge').hide();
        }
    }

    generateTemplateWYSIWYGEditor() {
        var onChangeTemplate = function (value) {
            setTemplateCode(value);
            this.updateTemplateLinesOfCodeBadges(value);
            if (_enableLivePreview === true) {
                generateHTML();
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
                    contentsChanged: function (e, editor) {
                        onChangeTemplate(editor.html.get());
                    }
                }
            }, function () {
                this._templateWYSIWYGEditor.html.set(getTemplateCode());
            });
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
                setup: function (ed) {
                    ed.on('change', function (e) {
                        onChangeTemplate(ed.getContent());
                    });
                }
            });
            this._templateWYSIWYGEditor = tinymce.get('txtTemplateWYSIWYG');
            this._templateWYSIWYGEditor.setContent(getTemplateCode());
            this._currentWYSIWYGTemplateEditorName = TEMPLATE_EDITOR_NAME_TINYMCE;
        }
    }

    generateTemplateEditor() {
        var onChangeTemplateEditor = function (value) {
            setTemplateCode(value);
            this.updateTemplateLinesOfCodeBadges(value);
            if (_enableLivePreview === true) {
                generateHTML();
            }
        };

        if (USE_ACE) {
            $('#txtTemplate').replaceWith('<pre id="txtTemplate" class="pre-ace-editor"></pre>');
            this._templateEditor = ace.edit("txtTemplate");
            //_templateEditor.setTheme("ace/theme/dracula");
            this._templateEditor.session.setMode("ace/mode/html");
            this._templateEditor.session.on('change', function (delta) {
                // delta.start, delta.end, delta.lines, delta.action
                onChangeTemplateEditor(this._templateEditor.getValue());
            });
            this._currentTemplateEditorName = TEMPLATE_EDITOR_NAME_ACE;
        }

        if (USE_CODEMIRROR) {
            this._templateEditor = CodeMirror.fromTextArea(document.getElementById('txtTemplate'), {
                value: getTemplateCode(),
                mode: 'text/html',
                //theme: 'dracula',
                lineNumbers: true,
                autoRefresh: true,
                lint: true,
                gutters: ["CodeMirror-lint-markers"],
                extraKeys: { "Ctrl-Space": "autocomplete" }
            });
            this._templateEditor.on('changes', function (cm, changes) {
                onChangeTemplateEditor(cm.getValue());
            });
            this._currentTemplateEditorName = TEMPLATE_EDITOR_NAME_CODEMIRROR;
        }
    }

    setTemplateEditorValue(code) {
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
        let templateCode = getTemplateCode();
        this.setTemplateEditorValue(templateCode);
        this.updateTemplateLinesOfCodeBadges(templateCode);
    }

    refresh() {
        if (USE_CODEMIRROR) {
            //setTimeout(function () {
            _this.templateEditor.refresh();
            //}, 100);
        }
    }
    
    enableWYSIWYGEditor() {
        _enableWYSIWYGTemplateEditor = true;
        localStorage.setItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR, _enableWYSIWYGTemplateEditor);

        initEditor();

        $('.main-template-editors-editor-container').hide();
        $('.main-template-editors-WYSIWYG-editor-container').show();
        $('#btnEnableWYSIWYGEditor').html(site.data.strings.editor.template.enabled_WYSIWYG_editor_btn).attr('class', 'btn btn-secondary');
    }
    disableWYSIWYGEditor() {
        _enableWYSIWYGTemplateEditor = false;
        localStorage.setItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR, _enableWYSIWYGTemplateEditor);

        initEditor();

        $('.main-template-editors-editor-container').show();
        $('.main-template-editors-WYSIWYG-editor-container').hide();
        $('#btnEnableWYSIWYGEditor').html(site.data.strings.editor.template.disabled_WYSIWYG_editor_btn).attr('class', 'btn btn-outline-secondary');
    }
}