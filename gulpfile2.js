/* jshint node:true */
'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify');

var deps = [
];
var files = [
  "./joint.dia.command.js",
  "./multiple-links.js",
  "./models.js",
  "./app.js",
  "./custom/JointTooledViewPlugin/tooledViewPlugin.js",
  "./test.js",
  "./load.js"
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
