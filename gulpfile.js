//load plugins
var gulp = require('gulp'),
    compass = require('gulp-compass'),
//scss = require('gulp-scss'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    plumber = require('gulp-plumber'),
    ngAnnotate = require('gulp-ng-annotate'),
    del = require('del'),
    path = require('path'),
    gulpif = require('gulp-if'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    replace = require('gulp-replace'),
    useref = require('gulp-useref'),
    htmlmin = require('gulp-html-minifier'),
    print = require('gulp-print');

//the title and icon that will be used for the Grunt notifications
var notifyInfo = {
    title: 'Gulp',
    icon: path.join(__dirname, 'gulp.png')
};

//error notification settings for plumber
var plumberErrorHandler = {
    //  errorHandler: notify.onError({
    // 	title: notifyInfo.title,
    // 	icon: notifyInfo.icon,
    // 	message: "Error: <%= error.message %>"
    // })
};

function swallowError(error) {
    // If you want details of the error in the console
    console.log(error.toString());
    this.emit('end');
}

//styles
gulp.task('styles', function () {
    var scss = require("gulp-scss");
    return gulp.src(['app/styles/*.scss'])
        .pipe(scss())
        // .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('app/styles'));
});

gulp.task('mystyles', function () {
    var scss = require("gulp-scss");
    return gulp.src('app/styles/tiger.scss')
        .pipe(scss())
        .on('error', swallowError)
        .pipe(gulp.dest('app/styles'))
        .pipe(livereload());
});

var t = Math.round(new Date().getTime() / 1000);
var htmlminPipe = htmlmin({
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true
});

gulp.task('compile', function () {
    del.sync('dist/styles/*');
    del.sync('dist/scripts/*');
    return gulp.src('app/index.html')
        .pipe(useref())
        .pipe(gulpif('**/tiger.min.js', ngAnnotate()))
        .pipe(gulpif('*.min.js', uglify()))
        .pipe(gulpif('*.fix.js', uglify({
            mangle: false,
            compress: false
        })))
        .pipe(gulpif('*.css', replace(/['"]views([^'"]*)\.html['"]/g, '"views$1.html?_t=' + t + '"')))
        .pipe(gulpif('*.css', minifycss()))
        .pipe(gulpif('!*.html', rev()))
        .pipe(revReplace())
        .pipe(gulp.dest('dist'));
});

gulp.task('replace-template', ['compile'], function () {
    return gulp.src('dist/scripts/tiger*.js')
        .pipe(replace(/['"]views([^'"]*)\.html['"]/g, '"views$1.html?_t=' + t + '"'))
        .pipe(gulp.dest('dist/scripts'));
});

gulp.task('replace-micro-service-url', ['replace-template'], function () {
    return gulp.src('dist/scripts/tiger*.js')
        .pipe(replace('http://t.dev.lieguanjia.com/v1', 'https://t.lieguanjia.com/v1'))
        .pipe(replace('http://wechat.dev.lieguanjia.com', 'https://wechat.lieguanjia.com'))
        .pipe(gulp.dest('dist/scripts'));
});

gulp.task('compile-index', ['compile'], function () {
    return gulp.src('dist/index.html')
        .pipe(replace(/ng-include=['"] *['"]views([^'"]*)\.html['"] *['"]/g, 'ng-include="\'views$1.html?_t=' + t + '\'"'))
        .pipe(replace(/ng-include="'version'"/g, 'ng-include="\'version?_t=' + t + '\'"'))
        .pipe(htmlminPipe)
        .pipe(gulp.dest('dist'));
});

gulp.task('template', function () {
    del.sync(['dist/views/**', '!dist/views']);
    return gulp.src([
        'app/views/**/*.html',
        '!app/views/pages/demo.html'
    ])
        .pipe(gulpif('*about/release_note.html', replace(/<dev>([\s\S]*?)<\/dev>/igm, '')))
        .pipe(replace(/ng-include=['"] *['"]views([^'"]*)\.html['"] *['"]/g, 'ng-include="\'views$1.html?_t=' + t + '\'"'))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest('dist/views'));
});

gulp.task('template-dev', function () {
    del.sync(['dist/views/**', '!dist/views']);
    return gulp.src([
        'app/views/**/*.html',
        '!app/views/pages/demo.html'
    ])
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest('dist/views'));
});

gulp.task('copy', function () {
    del.sync('dist/+(fonts|i18n|images|pdf_viewer)/**/*');
    del.sync('dist/**/iconfont/*');
    return gulp.src([
        'app/+(fonts|i18n|images|pdf_viewer)/**/*',
        'app/**/iconfont/*',
        'app/favicon.ico'
    ]).pipe(gulp.dest('dist'));
});

gulp.task('assist-lib', ['compile'], function () {
    return gulp.src('app/scripts/text-encoding/*')
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts/text-encoding'));
});

gulp.task('build', ['copy', 'template', 'compile', 'replace-template', 'compile-index', 'assist-lib', 'replace-micro-service-url'], function () {

});

gulp.task('build-dev', ['copy', 'template-dev', 'compile', 'replace-template', 'compile-index', 'assist-lib'], function () {

});


//watch
gulp.task('live', [
    'styles', 'mystyles'
], function () {
    livereload.listen({start: true});

    //watch .scss files
    gulp.watch('app/styles/**/*.scss', ['mystyles']);

    //watch .js files
    // gulp.watch('app/scripts/**/*.js', ['scripts']);

    //reload when a template file, the minified css, or the minified js file changes
    // gulp.watch('templates/**/*.html', 'html/css/styles.min.css', 'html/js/main.min.js', function(event) {
    // 	gulp.src(event.path)
    // 		.pipe(plumber())
    // 		.pipe(livereload())
    // 		.pipe(notify({
    // 			title: notifyInfo.title,
    // 			icon: notifyInfo.icon,
    // 			message: event.path.replace(__dirname, '').replace(/\\/g, '/') + ' was ' + event.type + ' and reloaded'
    // 		})
    // 	);
    // });
});
