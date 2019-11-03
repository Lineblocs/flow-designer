/* jshint node:true */
'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var karma = require('karma').server;
var argv = require('yargs').argv;
var $ = require('gulp-load-plugins')();
// Require plugins
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var mergeTemplates = require('./merge_templates');
var fs = require("fs");


gulp.task('styles', function() {
    return gulp.src([
        ])
    .pipe($.plumber())
    .pipe($.sass())
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('dist/styles'))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('jshint', function() {
    return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
//.pipe($.jshint.reporter('jshint-stylish'))
//.pipe($.jshint.reporter('fail'));
});

gulp.task('jscs', function() {
    return gulp.src('app/scripts/**/*.js')
    .pipe($.jscs());
});


gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('connect', ['styles'], function() {
    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');
    var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('./'))
// paths to bower_components should be relative to the current file
// e.g. in app/index.html you should use ../bower_components
.use('/bower_components', serveStatic('bower_components'))
.use(serveIndex('app'));

require('http').createServer(app)
.listen(9000)
.on('listening', function() {
    console.log('Started connect web server on http://localhost:9000');
});
});

gulp.task('serve', [ 'connect',  'watch'], function() {
    if (argv.open) {
        require('opn')('http://localhost:9000');
    }
});

gulp.task('test', function(done) {
    karma.start({
        configFile: __dirname + '/test/karma.conf.js',
        singleRun: true
    }, done);
});


gulp.task('watch', ['connect'], function() {
    $.livereload.listen();

// watch for changes
gulp.watch([
    'templates/*.html',
    'models/*.html',
    'src/*.js',
    'src/custom/JointTooledViewPlugin/*.js'
    ]).on('change', function() {
            gulp.start('scripts');
            mergeTemplates().then(function(output) {
                fs.writeFileSync("./templates.html", output);
            });
            $.livereload.changed.apply(null, arguments);
    });
});

var deps = [
];
var files = [
    "./src/*.js",
  "./src/custom/JointTooledViewPlugin/tooledViewPlugin.js"
];
/*
var files = deps.concat([
'./app/scripts/app.js',
'./app/scripts/controllers/*.js'
]);
*/

gulp.task('scripts', function() {
    return gulp.src(files)
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./'));
});
gulp.task('compress', function() {
  gulp.src(['./app/scripts/main.js'])
    .pipe(minify())
    .pipe(gulp.dest('./'))
});

