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
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var mergeTemplates = require('./merge_templates');
var fs = require("fs");
var path = require("path");
var cleanCSS = require("gulp-clean-css");
var sourcemaps  = require("gulp-sourcemaps");
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');



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
    function wildRoute(req, res) {
        fs.readFile('./index.html', (err, data) => {
            if (err) throw err;
            return res.end(data);
        });
    }
    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');
    var connectRoute = require('connect-route');
    var redirects = require('redirects');
    var modRewrite = require('connect-modrewrite');
    var serve = serveStatic("./");
    var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('./'))
    .use(connectRoute(function(router) {
        router.get("/create", wildRoute);
        router.get("/edit", wildRoute);
    }))
// paths to bower_components should be relative to the current file
// e.g. in app/index.html you should use ../bower_components
.use('/bower_components', serveStatic('bower_components'))
.use(serveIndex('app'))
.use(modRewrite([
    '^/create /',
    '^/edit$ /index.html [L]'
  ]));
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
            gulp.start('styles');
            gulp.start('compress-css');
            /*
            mergeTemplates().then(function(output) {
                fs.writeFileSync("./templates.html", output);
            });
            */
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
gulp.task('scripts', function() {
    console.log("starting scripts");
    return gulp.src(files)
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./app/scripts/'))
});
gulp.task('compress-js', ['scripts'], function() {
    var files = [
"./node_modules/jquery/dist/jquery.min.js",
"./node_modules/angular/angular.js",
"./src/extra.js", // important
"./node_modules/angular-aria/angular-aria.js",
"./node_modules/angular-route/angular-route.js",
"./node_modules/angular-animate/angular-animate.js",
"./node_modules/angular-sanitize/angular-sanitize.js",
"./node_modules/angular-material/angular-material.js",
"./node_modules/lodash/lodash.min.js",
"./node_modules/backbone/backbone-min.js",
"./node_modules/urijs/src/URI.js",
"./node_modules/jointjs/dist/joint.js",
"./src/svg-pan-zoom.min.js",
"./src/load.js",
"./src/icons.js",
"./src/models.js",
"./src/models-pickers.js",
"./src/multiple-links.js",
"./src/joint.dia.command.js",
"./src/app.js",
"./src/load.js"
    ];
  gulp.src(files)
            .pipe(concat('concat.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('main.min.js'))
        //.pipe(uglify({ mangle: false }))
        .pipe(gulp.dest('./'));

});
gulp.task('compress-css', ['styles'], function() {
    console.log("cleaning CSS");
gulp.src([
"./node_modules/angular-material/angular-material.css",
"./styles.css",
"./md-custom.css",
"./custom/JointTooledViewPlugin/tooledViewPlugin.css",
"./node_modules/@mdi/font/css/materialdesignicons.css",
"./node_modules/monaco-editor/min/vs/editor/editor.main.css",
"./joint-1.0.2.css"
  ])
        .pipe(concat('concat.css'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('main.min.css'))
    .pipe(cleanCSS(
       {
    }))
      .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
  }))
  .pipe(rename({
      basename: 'app',
      suffix: '.min',
  }))
  .pipe(gulp.dest('./'))

});
