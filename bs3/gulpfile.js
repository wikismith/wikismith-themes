var gulp = require('gulp');
var gutil = require('gulp-util');
var inject = require("gulp-inject");
var es = require('event-stream');
var wiredep = require('wiredep');
var path = require('path');
var fs = require("fs");

gulp.task('default', function(cb) {
    build(cb);
});

function build(cb) {

    var fsrc = __dirname;
    var fdst = path.join(process.cwd(), 'build', 'bs3');

    var bower_options = {
        directory:  path.join(fsrc, 'bower_components'),
        bowerJson:  require(path.join(fsrc, 'bower.json'))
    }

    var bower_js = wiredep(bower_options).js || 'undefined';
    var bower_css = wiredep(bower_options).css || 'undefined';

    var bower_assets = es.merge(
        gulp.src(bower_js).pipe(gulp.dest(path.join(fdst,'bower','js'))),
        gulp.src(bower_css).pipe(gulp.dest(path.join(fdst,'bower','css')))
    );

    var app_assets = es.merge(
        gulp.src([fsrc+'/js/**/*.js']).pipe(gulp.dest(path.join(fdst,'js'))),
        gulp.src([fsrc+'/css/**/*.css']).pipe(gulp.dest(path.join(fdst,'css')))
    );


    if (process.cwd() == __dirname ) {
        // Usefull for editing the template with relative paths.
        addRootSlash = false;
    }
    else {
        // Required for Static Site Generation
        addRootSlash = true;
    }

    var s1 = gulp.src(path.join(__dirname, 'template.html'))
        .pipe(inject(es.merge(bower_assets),
            {
                ignorePath: '/build/',
                starttag: '<!-- bower:{{ext}} -->',
                addRootSlash: addRootSlash
            }))
        .pipe(inject(es.merge(app_assets),
            {
                ignorePath: '/build/',
                addRootSlash: addRootSlash
            }))
        .pipe(gulp.dest(path.join(__dirname)))

    var s2 = gulp.src(path.join(__dirname,'img','**','*'))
        .pipe(gulp.dest(path.join(fdst,'img')))

    es.merge(s1,s2)
        .on('end', function() {
            cb()
        });
}

module.exports = build;
