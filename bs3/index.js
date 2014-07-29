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

// EXPORTED METHODS

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

module.exports = render;
