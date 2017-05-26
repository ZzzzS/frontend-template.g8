/**
 * Created by zzzz on 2017/5/26.
 */
"use strict";

const gulp = require('gulp');
const sass = require('gulp-ruby-sass');
const express = require('gulp-dev-express');
const cleanCSS = require('gulp-clean-css');
const rename = require("gulp-rename");
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const fileinclude = require('gulp-file-include');
const cache = require('gulp-cached');
const imagemin = require('gulp-imagemin');
const clean = require('gulp-clean');
const order = require("gulp-order");
const concat = require('gulp-concat');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const webpack = require('gulp-webpack');
const gulpif = require('gulp-if');


// style
gulp.task('sass', function () {
    sass(['./src/style/*.scss', '!src/style/components/*.scss'])
        .on('error', sass.logError)
        .pipe(gulp.dest('./dist/css'))
        .pipe(gulpif(process.env.NODE_ENV === 'development', sourcemaps.init()))
        .pipe(gulpif(process.env.NODE_ENV === 'production', cleanCSS({compatibility: 'ie8'})))
        .pipe(gulpif(process.env.NODE_ENV === 'development', sourcemaps.write()))
        .pipe(gulp.dest('./dist/css'))
        .pipe(notify({ message: 'Style task complete' }));
});

//html
gulp.task('html', function() {
    return gulp.src(['src/**/*.html', '!src/html/components/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(notify({ message: 'Html task complete' }));
});

// image
gulp.task('image', function() {
    return gulp.src('src/image/**/*')
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest('dist/res'))
        .pipe(notify({ message: 'image task complete' }));
});

// script
gulp.task('script', function() {
    return gulp.src('src/javascript/index.js')
        .pipe(webpack( require('./webpack.js') ))
        .pipe(gulp.dest('dist/js'))
        .pipe(notify({ message: 'script task complete' }));
});

// clean
gulp.task('clean', function() {
    return gulp.src(['dist/css', 'dist/js', 'dist/res', 'dist/*.html'], {read: false})
        .pipe(clean())
        .pipe(notify({ message: 'clean task complete' }));
});

// dev
gulp.task('dev', function () {
    process.env.NODE_ENV = 'development';
    gulp.watch('src/javascript/**/*.js', express('server.js'));
    gulp.watch('src/style/**/*.scss', ['sass']);
    gulp.watch('src/javascript/**/*.js', ['script']);
    gulp.watch('src/image/**/*', ['image']);
    gulp.watch('src/**/*.html', ['html']);
});

// build
gulp.task('build', ['clean'], function() {
    process.env.NODE_ENV = 'production';
    gulp.start('sass', 'script', 'image', 'html');
});

// default
gulp.task('default', ['clean'], function() {
    gulp.start('dev', 'sass', 'script', 'image', 'html');
});