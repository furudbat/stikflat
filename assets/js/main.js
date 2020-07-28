var generateHTMLFromTemplate = function (template, jsonstring, css) {
    clearTemplateError();
    clearConfigError();

    var json = {};
    try {
        if(jsonstring != "") {
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

            console.debug({template, json, css}, htmlstr);
        } catch (error) {
            var html = error.toString();
            console.error(error);

            setHTMLPreview(html, css);
            codePreview.setValue(html);
            setTemplateError(html);
        }
    }
};

var setHTMLPreview = function (htmlstr, cssstr) {
    var html = $.parseHTML('<style>' + cssstr + '</style>' + htmlstr);
    console.debug({cssstr, htmlstr}, html);

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
    var template = templateEditor.codeBeautifier.run(templateEditor.html.get());
    var json = configEditor.getValue();
    var css = cssEditor.getValue();
    generateHTMLFromTemplate(template, json, css);
};

var setConfigError = function (error) {
    $('#configError').addClass('visible').removeClass('invisible').html(error)
};
var clearConfigError = function () {
    $('#configError').removeClass('visible').addClass('invisible').html('')
};

var setTemplateError = function (error) {
    $('#configError').addClass('visible').removeClass('invisible').html(error)
};
var clearTemplateError = function () {
    $('#templateError').removeClass('visible').addClass('invisible').html('')
};

$(document).ready(function () {
    clearConfigError();
    clearTemplateError();

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
            contentChanged: function () {
                generateHTML();
            }
        }
    });
    configEditor = CodeMirror.fromTextArea(document.getElementById('txtConfig'), {
        value: "{}",
        mode: "application/json",
        lineNumbers: true,
        linter: true
    });
    configEditor.on("changes", function (cm, change) {
        generateHTML();
    })
    
    cssEditor = CodeMirror.fromTextArea(document.getElementById('txtCSS'), {
        mode: "text/css",
        lineNumbers: true,
        linter: true
    });
    cssEditor.on("changes", function (cm, change) {
        generateHTML();
    })

    codePreview = CodeMirror.fromTextArea(document.getElementById('preview-code'), {
        mode: "text/html",
        lineNumbers: true,
        readOnly: true
    });
});