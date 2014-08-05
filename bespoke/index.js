var gulp = require('gulp');
var gutil = require('gulp-util');
var marked = require('marked');
var highlight = require('highlight.js');
var ejs = require('ejs');
var xregexp = require('xregexp');
var path = require('path');
var fs = require("fs");
var renderer = new marked.Renderer();

function customizeMarked() {
    renderer.heading = function (text, level) {
        var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        if (level==1)
        {
            return '<h'+level+' class="page-header" id="md-'+escapedText+'">' + text + '</h' + level + '>';
        }
        else
        {
            return '<h'+level+' id="md-'+escapedText+'">' + text + '</h' + level + '>';
        }
    }

    marked.setOptions({
        renderer: renderer,
        highlight: function (code) {
            return require('highlight.js').highlightAuto(code).value;
        }
    });

}

function endify_headings(html) {
    var re = xregexp.XRegExp;
    var heading = re('<(?<heading>h[1-9])','sgi');
    html = html + '<!-- end -->';
    html = re.replace(html, heading, '<!-- ${heading} --><${heading}' )
    return html
}


function sectionify_headings(html) {
    var re = xregexp.XRegExp;

    var rowRegex = re('(?<body><h[2345].*?)(?<tail>(<!-- h[12345] -->|<!-- end -->))','sgi')

    html = re.replace(html,rowRegex,"<section>${body}</section>${tail}");
    return html;
}


function render(file) {
    var template = String(fs.readFileSync(path.join(__dirname, 'template.html')));

    var h = marked(file.body);;
    var h2 = endify_headings(h);
    var h3 = sectionify_headings(h2);

    return ejs.render(template, {
        params: file.params,
        content: h3,
        ast: marked.lexer(file.body)
    });
}


customizeMarked()
module.exports = render;


