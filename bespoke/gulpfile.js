var pkg = require('./package.json'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  plumber = require('gulp-plumber'),
  //rimraf = require('gulp-rimraf'),
  rename = require('gulp-rename'),
  connect = require('gulp-connect'),
  browserify = require('gulp-browserify'),
  uglify = require('gulp-uglify'),
  jade = require('gulp-jade'),
  stylus = require('gulp-stylus'),
  autoprefixer = require('gulp-autoprefixer'),
  csso = require('gulp-csso'),
  through = require('through'),
  opn = require('opn'),
  path = require('path'),
  es = require('event-stream');
  nib = require('nib');


var isDist = true; // process.argv.indexOf('serve') === -1;

function js() {
    var dest = path.join(process.cwd(), 'build', 'bespoke');

    return gulp.src(path.join(__dirname, 'src/scripts/main.js'))
        .pipe(isDist ? through() : plumber())
        .pipe(browserify({ transform: ['debowerify'], debug: !isDist }))
        .pipe(isDist ? uglify() : through())
        .pipe(rename('build.js'))
        .pipe(gulp.dest(dest))
}
gulp.task('js', js);

function css() {
    var dest = path.join(process.cwd(), 'build', 'bespoke');

    return gulp.src(path.join(__dirname, 'src/styles/main.styl'))
        .pipe(isDist ? through() : plumber())
        .pipe(stylus({
            // Allow CSS to be imported from node_modules and bower_components
            'include css': true,
            'paths': [path.join(__dirname, 'node_modules'), path.join(__dirname,'bower_components')],
            use: [nib()]
        }))
        .pipe(autoprefixer('last 2 versions', { map: false }))
        .pipe(isDist ? csso() : through())
        .pipe(rename('build.css'))
        .pipe(gulp.dest(dest))
}

gulp.task('css', css);

function images() {
    var dest = path.join(process.cwd(), 'build', 'bespoke');

    var d = path.join(dest, 'images');
    return gulp.src(path.join(__dirname, 'src/images/**/*'))
        .pipe(gulp.dest(d))
}

gulp.task('images', images);

function build(cb) {
    var dest = path.join(process.cwd(), 'build', 'bespoke');

    es.merge(js(), css(), images())
        .on('end', function() {
        cb()
        });
}

gulp.task('build', ['js', 'css', 'images']);
gulp.task('default', ['build']);

module.exports = build;