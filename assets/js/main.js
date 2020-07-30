'use strict';

const STORAGE_KEY_TEMPLATE_CODE = 'template_code';
const STORAGE_KEY_CONFIG_CODE = 'config_code';
const STORAGE_KEY_CSS_CODE = 'css_code';
const STORAGE_KEY_LOCK_CONFIG_CODE = 'lock_config_code';
const STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR = 'enable_WYSIWYG_template_editor';

const TEMPLATE_EDITOR_NAME_CODEMIRROR = 'CodeMirror';
const TEMPLATE_EDITOR_NAME_TINYMCE = 'TinyMCE';
const TEMPLATE_EDITOR_NAME_FROALAEDITOR = 'FroalaEditor';

var _templateEditor = null;
var _templateWYSIWYGEditor = null;
var _configEditor = null;
var _cssEditor = null;
var _codePreviewEditor = null;

var _templateCode = '';
var _configJson = {};
var _cssCode = '';
var _codePreview = '';
var _currentPattern = '';
var _lockConfigCode = false;
var _enableWYSIWYGTemplateEditor = false;
var _currentTemplateEditorName = '';
var _currentWYSIWYGTemplateEditorName = '';

var loadFromStorage = function () {
    _templateCode = localStorage.getItem(STORAGE_KEY_TEMPLATE_CODE) || '';
    try {
        _configJson = $.parseJSON(localStorage.getItem(STORAGE_KEY_CONFIG_CODE)) || {};
    } catch (e) {
        console.log({ loadFromStorage: 'parse CONFIG_CODE', e });
        _configJson = {};
    }
    _cssCode = localStorage.getItem(STORAGE_KEY_CSS_CODE) || '';
    _lockConfigCode = localStorage.getItem(STORAGE_KEY_LOCK_CONFIG_CODE) == "true" || false;
    _enableWYSIWYGTemplateEditor = localStorage.getItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR) == "true" || false;

    console.log('loadFromStorage', { _templateCode, _configJson, _cssCode, _lockConfigCode, _enableWYSIWYGTemplateEditor });
};

var getTemplateCode = function () {
    return _templateCode;
};
var getConfigCode = function () {
    return JSON.stringify(_configJson, null, 4);
};
var getCssCode = function () {
    return _cssCode;
};

var setTemplateCode = function (code) {
    _templateCode = code;
    localStorage.setItem(STORAGE_KEY_TEMPLATE_CODE, code);
};
var setConfigJson = function (json) {
    _configJson = json;
    localStorage.setItem(STORAGE_KEY_CONFIG_CODE, JSON.stringify(json));
};
var setCssCode = function (code) {
    _cssCode = code;
    localStorage.setItem(STORAGE_KEY_CSS_CODE, code);
};
var setCodePreview = function (code) {
    _codePreview = code;
    _codePreviewEditor.setValue(code);
    
    setTimeout(function () {
        _codePreviewEditor.refresh();
    }, 200);
};

var generateHTMLFromTemplate = function (template, json, css, onlypreview = false) {
    clearTemplateError();
    clearConfigError();

    if (typeof json === 'string' || json instanceof String) {
        try {
            if (json != "") {
                json = JSON.parse(json);
            }
        } catch (error) {
            json = {}
            var html = error.toString();
            if (onlypreview == true) {
                setHTMLPreview(html, "");
            } else {
                setConfigError(html)
            }
        }
    }

    if (json != null) {
        try {
            var htmlstr = Mustache.render(template, json);
            setHTMLPreview(htmlstr, css);
            if (onlypreview == false) {
                setCodePreview(html_beautify(htmlstr));
            }
        } catch (error) {
            console.log(error);

            if (onlypreview == true) {
                setHTMLPreview(error.toString(), css);
            } else {
                setTemplateError(error.toString());
                setHTMLPreview(error.toString(), css);
                setCodePreview(error.toString());
            }
        }
    }
};

var setHTMLPreview = function (htmlstr, css) {
    var html = $.parseHTML('<style>' + css + '</style>' + htmlstr);
    $('#preview-html').html(html);
};

var generateHTML = function () {
    var template = getTemplateCode();
    var json = getConfigCode();
    var css = getCssCode();

    generateHTMLFromTemplate(template, json, css);
};

var setConfigError = function (error) {
    $('#configError').html(error).show();
};
var clearConfigError = function () {
    $('#configError').hide().empty();
};

var setTemplateError = function (error) {
    $('#configError').html(error).show();
};
var clearTemplateError = function () {
    $('#templateError').hide().empty();
};

var setTemplateError = function () {
    $('#configError').html(error).show();
};
var clearTemplateError = function () {
    $('#templateError').hide().empty();
};


var clearLayoutInfo = function () {
    $('#layout-pattern-info').hide().empty();
}
var updateLayoutInfo = function (pattern) {
    var name = $(pattern).data('name');
    var author = $(pattern).data('author');
    var authorLink = $(pattern).data('author-link');
    var description = $(pattern).data('description');
    var link = $(pattern).data('link');
    var license = $(pattern).data('license');

    var header = '<p class="text-bold">';
    header += name + ' by ' + '<a href="' + authorLink + '" target="_blank">' + author + '</a>';
    if (link != "") {
        header += ' - ' + '<a href="' + link + '" target="_blank">' + link + '</a>';
    }
    header += '</p>';

    $('#layout-pattern-info').empty()
        .append(header)
        .append('<p class="text-justify">' + description + '</p>')
        .append('<p class="font-italic">' + license + '</p>')
        .show();
};



var generateTemplateWYSIWYGEditor = function () {
    if (USE_FROLALA_EDITOR) {
        _templateWYSIWYGEditor = new FroalaEditor('#txtTemplateWYSIWYG', {
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
                    setTemplateCode(editor.html.get());
                    generateHTML();
                }
            }
        }, function () {
            _templateWYSIWYGEditor.html.set(getTemplateCode());
        });
        _currentWYSIWYGTemplateEditorName = TEMPLATE_EDITOR_NAME_FROALAEDITOR;
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
            setup: function(ed) {
                ed.on('change', function(e) {
                    setTemplateCode(ed.getContent());
                    generateHTML();
                });
            }
        });
        _templateWYSIWYGEditor = tinymce.get('txtTemplateWYSIWYG');
        _templateWYSIWYGEditor.setContent(getTemplateCode());
        _currentWYSIWYGTemplateEditorName = TEMPLATE_EDITOR_NAME_TINYMCE;
    }
};

var generateTemplateEditor = function () {
    _templateEditor = CodeMirror.fromTextArea(document.getElementById('txtTemplate'), {
        value: getCssCode(),
        mode: 'text/html',
        //theme: 'dracula',
        lineNumbers: true,
        autoRefresh: true
    });
    _templateEditor.on("changes", function (cm, changes) {
        setTemplateCode(cm.getValue());
        generateHTML();
    });
    _currentTemplateEditorName = TEMPLATE_EDITOR_NAME_CODEMIRROR
};

var generateConfigEditor = function () {
    _configEditor = CodeMirror.fromTextArea(document.getElementById('txtConfig'), {
        value: getConfigCode(),
        mode: 'application/json',
        //theme: 'dracula',
        lineNumbers: true,
        linter: true,
        spellcheck: true,
        autoRefresh: true
    });
    _configEditor.on('changes', function (cm, changes) {
        var jsonstring = cm.getValue();
        try {
            if (jsonstring != "") {
                setConfigJson($.parseJSON(jsonstring));
                generateHTML();
            }
        } catch (error) {
            setConfigError(error.toString());
        }
    });
};

var generateCssEditor = function () {
    _cssEditor = CodeMirror.fromTextArea(document.getElementById('txtCSS'), {
        value: getCssCode(),
        mode: 'text/css',
        //theme: 'dracula',
        //lineNumbers: true,
        linter: true,
        autoRefresh: true
    });
    _cssEditor.on("changes", function (cm, changes) {
        setCssCode(cm.getValue());
        generateHTML();
    });
};

var generateCodePreviewEditor = function () {
    _codePreviewEditor = CodeMirror.fromTextArea(document.getElementById('preview-code'), {
        mode: 'text/html',
        //theme: 'dracula',
        lineNumbers: true,
        readOnly: true,
        autoRefresh: true
    });
};

var setTemplateEditorValue = function(code){
    if (_currentWYSIWYGTemplateEditorName == TEMPLATE_EDITOR_NAME_TINYMCE) {
        _templateWYSIWYGEditor.setContent(code);
    } else if (_currentWYSIWYGTemplateEditorName == TEMPLATE_EDITOR_NAME_FROALAEDITOR) {
        _templateWYSIWYGEditor.html.set(code);
    }
    
    _templateEditor.setValue(code);
    
    setTimeout(function () {
        _templateEditor.refresh();
    }, 200);
};

var initEditors = function () {
    setTimeout(function () {
        setTemplateEditorValue(getTemplateCode());
        _cssEditor.setValue(getCssCode());
        _configEditor.setValue(getConfigCode());

        setTimeout(function () {
            _cssEditor.refresh();
            _configEditor.refresh();
        }, 200);
    }, 100);
};


var hideConfigEditor = function () {
    $('.main-template-editors-container').removeClass('col-md-8').addClass('col-md-12').show()
    $('.main-config-editors-container').hide();
};
var showConfigEditor = function () {
    $('.main-template-editors-container').addClass('col-md-8').removeClass('col-md-12').show();
    $('.main-config-editors-container').show();

    setTimeout(function () {
        _configEditor.refresh();
    }, 200);
};
var showPreview = function () {
    hideConfigEditor();
    $('#templateTabs a[href="#previewTabContent"]').tab('show');
};

var enableWYSIWYGEditor = function () {
    _enableWYSIWYGTemplateEditor = true;
    localStorage.setItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR, _enableWYSIWYGTemplateEditor);

    initEditors();

    $('.main-template-editors-editor-container').hide();
    $('.main-template-editors-WYSIWYG-editor-container').show();
    $('#btnEnableWYSIWYGEditor').html('WYSIWYG Editor enabled').attr('class', 'btn btn-secondary');
};
var disableWYSIWYGEditor = function () {
    _enableWYSIWYGTemplateEditor = false;
    localStorage.setItem(STORAGE_KEY_ENABLE_WYSIWYG_TEMPLATE_EDITOR, _enableWYSIWYGTemplateEditor);

    initEditors();
    
    $('.main-template-editors-editor-container').show();
    $('.main-template-editors-WYSIWYG-editor-container').hide();
    $('#btnEnableWYSIWYGEditor').html('WYSIWYG Editor disabled').attr('class', 'btn btn-outline-secondary');
};


var lockConfig = function () {
    _lockConfigCode = true;
    localStorage.setItem(STORAGE_KEY_LOCK_CONFIG_CODE, _lockConfigCode);
    $('#lblLockConfig').html("Config Locked, Don't override config when selecting Layout");
};

var unlockConfig = function () {
    _lockConfigCode = false;
    localStorage.setItem(STORAGE_KEY_LOCK_CONFIG_CODE, _lockConfigCode);
    $('#lblLockConfig').html("Config Unlocked, Override config when selecting Layout");
};


var selectPreviewTab = function() {
    $('#templateTabs a[href="#previewTabContent"]').tab('show');
    hideConfigEditor();
};
var selectTemplateTab = function() {
    $('#templateTabs a[href="#templateTabContent"]').tab('show');
    showConfigEditor();
    
    setTimeout(function () {
        _templateEditor.refresh();
    }, 200);
};
var selectCssTab = function () {
    $('#templateTabs a[href="#cssTabContent"]').tab('show');
    showConfigEditor();
    
    setTimeout(function () {
        _cssEditor.refresh();
    }, 200);
};


$(document).ready(function () {
    loadFromStorage();
    
    setTemplateCode(_templateCode);
    setConfigJson(_configJson);
    setCssCode(_cssCode);

    clearConfigError();
    clearTemplateError();
    clearLayoutInfo();
    
    generateTemplateEditor();
    generateTemplateWYSIWYGEditor();
    generateConfigEditor();
    generateCssEditor();
    generateCodePreviewEditor();

    initEditors();
    generateHTML();
    
    
    if (_lockConfigCode == true) {
        $('#btnLockConfig').bootstrapToggle('on');
        lockConfig();
    } else {
        $('#btnLockConfig').bootstrapToggle('off');
        unlockConfig();
    }
    if (_enableWYSIWYGTemplateEditor == true) {
        enableWYSIWYGEditor();
    } else {
        disableWYSIWYGEditor();
    }

    if (getTemplateCode() == "") {
        selectPreviewTab();
    } else {
        selectTemplateTab();
    }



    $('#templateTabs a[href="#previewTabContent"]').on('click', function (e) {
        selectPreviewTab();
    });
    $('#templateTabs a[href="#templateTabContent"]').on('click', function (e) {
        selectTemplateTab();
    });
    $('#templateTabs a[href="#cssTabContent"]').on('click', function (e) {
        selectCssTab();
    });

    $('#btnEnableWYSIWYGEditor').click(function () {
        _enableWYSIWYGTemplateEditor = !_enableWYSIWYGTemplateEditor;
        if (_enableWYSIWYGTemplateEditor == true) {
            enableWYSIWYGEditor();
        } else {
            disableWYSIWYGEditor();
        }
    });

    $('#btnLockConfig').change(function () {
        _lockConfigCode = $(this).prop('checked');
        if (_lockConfigCode == true) {
            lockConfig();
        } else {
            unlockConfig();
        }
    });
    $('.generate-btn').click(function () {
        generateHTML();
    });

    $('.layout-pattern').dblclick(function () {
        var name = $(this).data('name');
        var getTemplate = $.get($(this).data('template'));
        var getConfig = $.get($(this).data('config'));
        var getCSS = $.get($(this).data('css'));

        $.when(getTemplate, getConfig, getCSS).done((templateRes, configRes, cssRes) => {
            _currentPattern = name;
            var template = templateRes[0];
            var css = cssRes[0];

            var config = configRes[0];
            if (_lockConfigCode == true) {
                config = _configJson;
            }

            var configJson = {};
            try {
                if (typeof config === 'string' || config instanceof String) {
                    configJson = $.parseJSON(config, null, 4);
                } else {
                    configJson = config;
                }
            } catch (e) {
                console.log(e);
            }

            setTemplateCode(template);
            setConfigJson(configJson);
            setCssCode(css_beautify(css));

            initEditors();
            generateHTML();
        });
        updateLayoutInfo(this);
    });
    $('.layout-pattern').click(function () {
        var name = $(this).data('name');
        var getTemplate = $.get($(this).data('template'));
        var getConfig = $.get($(this).data('config'));
        var getCSS = $.get($(this).data('css'));

        $.when(getTemplate, getConfig, getCSS).done((templateRes, configRes, cssRes) => {
            _currentPattern = name;

            var template = templateRes[0];
            var config = configRes[0];
            var css = cssRes[0];

            generateHTMLFromTemplate(template, config, css, true);
            showPreview();
        });
        updateLayoutInfo(this);
    });
});