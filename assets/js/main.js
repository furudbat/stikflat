'use strict';

const STORAGE_KEY_TEMPLATE_CODE = 'template_code';
const STORAGE_KEY_CONFIG_CODE = 'config_code';
const STORAGE_KEY_CSS_CODE = 'css_code';
const STORAGE_KEY_LOCK_CONFIG_CODE = 'lock_config_code';
const STORAGE_KEY_DISABLE_WYSIWYG_TEMPLATE_EDITOR = 'disable_WYSIWYG_template_editor';

var _templateEditor = null;
var _configEditor = null;
var _cssEditor = null;
var _codePreviewEditor = null;

var _templateCode = '';
var _configCode = '';
var _cssCode = '';
var _codePreview = '';
var _currentPattern = '';
var _lockConfigCode = false;
var _disableWYSIWYGTemplateEditor = true;

//console.debug({ _templateCode, _configCode, _codePreview, _currentPattern, _lockConfigCode, _disableWYSIWYGTemplateEditor });

var loadFromStorage = function () {
    _templateCode = localStorage.getItem(STORAGE_KEY_TEMPLATE_CODE) || '';
    _configCode = localStorage.getItem(STORAGE_KEY_CONFIG_CODE) || '';
    _cssCode = localStorage.getItem(STORAGE_KEY_CSS_CODE) || '';
    _lockConfigCode = localStorage.getItem(STORAGE_KEY_LOCK_CONFIG_CODE) == "true" || false;
    _disableWYSIWYGTemplateEditor = localStorage.getItem(STORAGE_KEY_DISABLE_WYSIWYG_TEMPLATE_EDITOR) || true;
};

var getTemplateCode = function () {
    return _templateCode;
}
var getConfigCode = function () {
    return _configCode;
}
var getCssCode = function () {
    return _cssCode;
}

var setTemplateCode = function (code) {
    _templateCode = code;
    localStorage.setItem(STORAGE_KEY_TEMPLATE_CODE, code);
    _templateEditor.html.set(code);
}
var setConfigCode = function (code) {
    _configCode = code;
    localStorage.setItem(STORAGE_KEY_CONFIG_CODE, code);
    _configEditor.setValue(code);
}
var setCssCode = function (code) {
    _cssCode = code;
    localStorage.setItem(STORAGE_KEY_CSS_CODE, code);
    _cssEditor.setValue(code);
}
var setCodePreview = function (code) {
    _codePreview = code;
    _codePreviewEditor.setValue(code);
}


var generateHTMLFromTemplate = function (template, jsonstring, css) {
    clearTemplateError();
    clearConfigError();

    var json = {};
    try {
        if (jsonstring != "") {
            json = JSON.parse(jsonstring);
        }
    } catch (error) {
        json = {}
        var html = error.toString();
        setConfigError(html)
    }

    if (json != null) {
        try {
            var htmlstr = Mustache.render(template, json);
            setHTMLPreview(htmlstr, css);
            setCodePreview(html_beautify(htmlstr));

            //console.debug({ template, json, css }, htmlstr);
        } catch (error) {
            var html = error.toString();
            console.error(error);

            setHTMLPreview(html, css);
            setCodePreview(html);
            setTemplateError(html);
        }
    }
};

var setHTMLPreviewFromTemplate = function (template, json, css) {
    if (json != null) {
        try {
            var htmlstr = Mustache.render(template, json);
            setHTMLPreview(htmlstr, css);
        } catch (error) {
            var html = error.toString();
            console.error(error);

            setHTMLPreview(html, css);
        }
    }
};

var setHTMLPreview = function (htmlstr, cssstr) {
    //console.debug({ _templateCode, _configCode, _codePreview, _currentPattern, _lockConfigCode, _disableWYSIWYGTemplateEditor });

    var html = $.parseHTML('<style>' + cssstr + '</style>' + htmlstr);

    $('#preview-html').html(html);
}

var generateHTML = function () {
    var template = getTemplateCode();
    var json = getConfigCode();
    var css = getCssCode();
    generateHTMLFromTemplate(template, json, css);
};

var setConfigError = function (error) {
    $('#configError').addClass('visible').removeClass('invisible').html(error)
};
var clearConfigError = function () {
    $('#configError').removeClass('visible').addClass('invisible').empty()
};

var setTemplateError = function (error) {
    $('#configError').addClass('visible').removeClass('invisible').html(error)
};
var clearTemplateError = function () {
    $('#templateError').removeClass('visible').addClass('invisible').empty()
};

var setTemplateError = function () {
    $('#configError').addClass('visible').removeClass('invisible').html(error)
};
var clearTemplateError = function () {
    $('#templateError').removeClass('visible').addClass('invisible').empty()
};


var clearLayoutInfo = function () {
    $('#layout-pattern-info').removeClass('visible').addClass('invisible').empty()
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

    $('#layout-pattern-info').addClass('d-inline').removeClass('d-none').empty()
        .append(header)
        .append('<p class="text-justify">' + description + '</p>')
        .append('<p class="font-italic">' + license + '</p>');

};



var generateTemplateEditor = function () {
    _templateEditor = new FroalaEditor('#txtTemplate', {
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
                _templateCode = editor.html.get();
                generateHTML();
            }
        }
    }, function () {
        _templateEditor.html.set(_templateCode);
    });
};

var generateConfigEditor = function () {
    _configEditor = CodeMirror.fromTextArea(document.getElementById('txtConfig'), {
        value: _configCode,
        mode: 'application/json',
        lineNumbers: true,
        linter: true
    });
    _configEditor.on('changes', function (cm, changes) {
        _configCode = cm.getValue();
        generateHTML();
    });
};

var generateCssEditor = function () {
    _cssEditor = CodeMirror.fromTextArea(document.getElementById('txtCSS'), {
        value: _cssCode,
        mode: 'text/css',
        //lineNumbers: true,
        linter: true
    });
    _cssEditor.on("changes", function (cm, changes) {
        _cssCode = cm.getValue();
        generateHTML();
    });
};

var generateCodePreviewEditor = function () {
    _codePreviewEditor = CodeMirror.fromTextArea(document.getElementById('preview-code'), {
        mode: 'text/html',
        lineNumbers: true,
        readOnly: true
    });
};

var initEditors = function () {
    setTimeout(function () {
        _templateEditor.html.set(_templateCode);
        _cssEditor.setValue(_cssCode);
        _configEditor.setValue(_configCode);

        console.debug({ _templateCode, _cssCode, _configCode });
    }, 500);
};

var lockConfig = function () {
    _lockConfigCode = true;
    localStorage.setItem(STORAGE_KEY_LOCK_CONFIG_CODE, _lockConfigCode);

    //$('.main-config-unlock-container').removeClass('d-inline');
    //$('.main-config-unlock-container').addClass('d-none');
    //$('.main-config-lock-container').removeClass('d-none');
    //$('.main-config-lock-container').addClass('d-inline');
    $('#lockConfigHelp').html("Config Locked, Don't override config when selecting Layout");

    console.log({ _lockConfigCode });
};

var unlockConfig = function () {
    _lockConfigCode = false;
    localStorage.setItem(STORAGE_KEY_LOCK_CONFIG_CODE, _lockConfigCode);

    //$('.main-config-lock-container').removeClass('d-inline');
    //$('.main-config-lock-container').addClass('d-none');
    //$('.main-config-unlock-container').removeClass('d-none');
    //$('.main-config-unlock-container').addClass('d-inline');
    $('#lockConfigHelp').html("Config Unlocked, Override config when selecting Layout");

    console.log({ _lockConfigCode });
};

$(document).ready(function () {
    loadFromStorage();

    var hideConfigEditor = function (e) {
        $('.main-template-editors-container').removeClass('col-md-8').addClass('col-md-12').addClass('d-inline');
        $('.main-config-editors-container').removeClass('d-inline').addClass('d-none');
    };
    var showConfigEditor = function (e) {
        $('.main-template-editors-container').addClass('col-md-8').removeClass('col-md-12').addClass('d-inline');
        $('.main-config-editors-container').addClass('d-inline').removeClass('d-none');
    };
    var showPreview = function () {
        hideConfigEditor();
        $('#templateTabs a[href="#previewTabContent"]').tab('show');
    };

    clearConfigError();
    clearTemplateError();
    clearLayoutInfo();

    generateTemplateEditor();
    generateConfigEditor();
    generateCssEditor();
    generateCodePreviewEditor();

    initEditors();

    if (_lockConfigCode == true) {
        lockConfig();
    } else {
        unlockConfig();
    }
    showPreview();

    $('#templateTabs a[href="#previewTabContent"]').on('click', function (e) {
        hideConfigEditor(e);
        $(this).tab('show');
    });
    $('#templateTabs a[href="#templateTabContent"]').on('click', function (e) {
        showConfigEditor(e);
        $(this).tab('show');
    });
    $('#templateTabs a[href="#cssTabContent"]').on('click', function (e) {
        showConfigEditor(e);
        $(this).tab('show');
    });

    $('#btnLockConfig').click(function () {
        lockConfig();
    });
    $('#btnUnlockConfig').click(function () {
        unlockConfig();
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
            var config = _configCode;
            if (_lockConfigCode == false) {
                config = configRes[0];
            }
            var css = cssRes[0];

            if (!(typeof config === 'string' || config instanceof String)) {
                config = JSON.stringify(configRes[0], null, 4);
            }

            console.log({ template, config, css });

            setTemplateCode(template);
            setConfigCode(js_beautify(config, { indent_size: 4, space_in_empty_paren: true }));
            setCssCode(css_beautify(css));

            setHTMLPreviewFromTemplate(template, config, css);
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

            setHTMLPreviewFromTemplate(template, config, css);
            showPreview();
        });
        updateLayoutInfo(this);
    });
});