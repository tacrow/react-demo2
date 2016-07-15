'use strict';
/*
 * react-demo2 gulpfile.js
 */

var gulp = require('gulp'),
	gutil = require('gulp-util'),
	$ = require('gulp-load-plugins')(),
	del = require('del'),
	sass = require('gulp-ruby-sass'),
	runSequence = require('run-sequence');

var browserify = require('browserify'),
	babelify = require('babelify'),
	watchify = require('watchify'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	sourcemaps = require('gulp-sourcemaps');

var cssnano = [
	require('cssnano')({ mergeRules: false })
];

var src = {
	scss:      'resources/scss/**/*.scss',
	css:       'public/assets/css/*.css',
	dest_css:  'public/assets/css/',
	target_js: 'public/assets/js/app.js',
	bundle_js: 'public/assets/js/bundle/bundle.js',
	dest_js:   'public/assets/js/bundle/',
}

gulp.task('clean', function(cb) {
	return del([src.css], cb);
});

// scss task
gulp.task('sass', function() {
	return sass(src.scss, { noCache: true, style: 'expanded' })
	.pipe($.plumber())
	.pipe($.autoprefixer())
	.pipe(gulp.dest(src.dest_css));
});

// css task
gulp.task('postcss-cssnano', function() {
	return gulp.src(src.css)
	.pipe($.plumber())
	.pipe($.postcss(cssnano))
	.pipe(gulp.dest(src.dest_css));
});

// js task
var b = browserify({
	entries: src.target_js,
	transform: ['babelify'],
	cache: {},
	packageCache: {},
	plugin: [watchify]
})
.on('update', bundle)
.on('log', gutil.log)

function bundle() {
	return b.bundle()
	.on('error', gutil.log.bind(gutil, 'Browserify Error'))
	.pipe(source('bundle.js'))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest(src.dest_js));
}

gulp.task('bundle', bundle);

gulp.task('uglify', function() {
	return gulp.src(src.bundle_js)
	.pipe($.plumber())
	.pipe($.uglify({ mangle: false, preserveComments: 'some' }))
	.pipe(gulp.dest(src.dest_js));
});

// watch
gulp.task('watch', function() {
	gulp.watch(src.scss, ['sass']);
	gulp.watch(src.target_js, ['bundle']);
});

//build
gulp.task('build', function(cb) {
	runSequence('clean', 'sass', 'postcss-cssnano', 'bundle', 'uglify', cb);
});

// default
gulp.task('default', ['watch']);
