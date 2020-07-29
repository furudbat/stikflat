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
            codePreview.setValue(htmlstr);

            console.debug({ template, json, css }, htmlstr);
        } catch (error) {
            var html = error.toString();
            console.error(error);

            setHTMLPreview(html, css);
            codePreview.setValue(html);
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
    var html = $.parseHTML('<style>' + cssstr + '</style>' + htmlstr);
    console.debug({ cssstr, htmlstr }, html);

    /*
    var sandbox = $('<html><head></head><body><div id="main-content"></div></body></html>');
    var head = sandbox.find("head");
    var headlinklast = head.find("link[rel='stylesheet']:last");
    if (headlinklast.length){
        headlinklast.after('<style>' + cssstr + '</style>');
    } else {
        head.append('<style>' + cssstr + '</style>');
    }
    sandbox.find('#main-content').html(html);

    console.log(sandbox.html());
    */

    $('#preview-html').html(html);
}

var generateHTML = function () {
    var template = templateEditor.html.get();
    var json = configEditor.getValue();
    var css = cssEditor.getValue();
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

    var header = '<p>';
    header += name + ' by ' + '<a href="' + authorLink + '" target="_blank">' + author + '</a>';
    if (link != "") {
        header += ' - ' + '<a href="' + link + '" target="_blank">' + link + '</a>';
    }
    header += '</p>';

    $('#layout-pattern-info').addClass('visible').removeClass('invisible').empty()
        .append(header)
        .append('<p class="text-justify">' + description + '</p>')
        .append('<p class="font-italic">' + license + '</p>');

};

$(document).ready(function () {
    clearConfigError();
    clearTemplateError();
    clearLayoutInfo();

    $('#generate').click(function () {
        generateHTML();
    });

    templateEditor = new FroalaEditor('#txtTemplate', {
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
            contentsChanged: function () {
                generateHTML();
            }
        }
    });
    configEditor = CodeMirror.fromTextArea(document.getElementById('txtConfig'), {
        value: '{}',
        mode: 'application/json',
        lineNumbers: true,
        linter: true
    });
    configEditor.on('changes', function (cm, change) {
        generateHTML();
    })

    cssEditor = CodeMirror.fromTextArea(document.getElementById('txtCSS'), {
        mode: 'text/css',
        lineNumbers: true,
        linter: true
    });
    cssEditor.on("changes", function (cm, change) {
        generateHTML();
    })

    codePreview = CodeMirror.fromTextArea(document.getElementById('preview-code'), {
        mode: 'text/html',
        lineNumbers: true,
        readOnly: true
    });

    
    $('.layout-pattern').dblclick(function () {
        var name = $(this).data('name');
        var getTemplate = $.get($(this).data('template'));
        var getConfig = $.get($(this).data('config'));
        var getCSS = $.get($(this).data('css'));

        $.when(getTemplate, getConfig, getCSS).done((templateRes, configRes, cssRes) => {
            console.debug(name);

            var template = templateRes[0];
            var config = configRes[0];
            var css = cssRes[0];

            templateEditor.html.set(template);
            configEditor.setValue(JSON.stringify(config, null, 4));
            cssEditor.setValue(css);

            setHTMLPreviewFromTemplate(template, config, css);
        });
        updateLayoutInfo(this);
    });
    $('.layout-pattern').click(function () {
        var name = $(this).data('name');
        var getTemplate = $.get($(this).data('template'));
        var getConfig = $.get($(this).data('config'));
        var getCSS = $.get($(this).data('css'));
        console.debug(name);

        $.when(getTemplate, getConfig, getCSS).done((templateRes, configRes, cssRes) => {
            console.debug(name);

            var template = templateRes[0];
            var config = configRes[0];
            var css = cssRes[0];

            setHTMLPreviewFromTemplate(template, config, css);
        });
        updateLayoutInfo(this);
    });
});