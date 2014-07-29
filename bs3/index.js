var gulp = require('gulp');
var gutil = require('gulp-util');
var inject = require("gulp-inject");
var es = require('event-stream');
var wiredep = require('wiredep');

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
            return code;
        }
    });

}

function leadify_h1s(html) {
    return html;
    var re = xregexp.XRegExp;
    var lRegex = re('(?<body><h1.*?)(?<pstart>(<p)(<prest>.*?</p>)(?<tail>(<!-- h[1-9] -->|<!-- end -->))','sgi')
    html = re.replace(html,lRegex,"${body}${pstart} class='lead' ${prest}${tail}");
    return html;
}

function endify_headings(html) {
    var re = xregexp.XRegExp;
    var heading = re('<(?<heading>h[1-9])','sgi');
    html = html + '<!-- end -->';
    html = re.replace(html, heading, '<!-- ${heading} --><${heading}' )
    return html
}


function rowify_h3s(html) {
    var re = xregexp.XRegExp;

    var rowRegex = re('(?<body><h3.*?)(?<tail>(<!-- h[12] -->|<!-- end -->))','sgi')
    var colRegex = re('(?<body><h3.*?)(?<tail>(<!-- h[123] -->|<!-- end -->))','sgi')

    html = re.replace(html,rowRegex,"<div class='row'>${body}</div>${tail}");
    html = re.replace(html,colRegex,"<div class='col-sm-4'>${body}</div>${tail}");
    return html;
}


function render(file) {
    var template = String(fs.readFileSync(path.join(__dirname, 'template.html')));

    var h = marked(file.body);;
    var h2 = endify_headings(h);
    var h3 = rowify_h3s(h2);
    //var h = leadify_h1s(h);

    //gutil.log(JSON.stringify(marked.lexer(file.body)))

    return ejs.render(template, {
        params: file.params,
        content: h3,
        ast: marked.lexer(file.body)
    });
}

customizeMarked()
module.exports = render;
