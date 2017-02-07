var gulp = require('gulp');
var gulpUtil = require('gulp-util');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var gsync = require('gulp-sync')(gulp);
var uglify = require('gulp-uglify');
var RevAll = require('gulp-rev-all');

var seatransport = require('gulp-seajs-transport');
var seaconcat = require('gulp-seajs-concat');
var searevmap = require('gulp-seajs-revmap');

var less = require('gulp-less');
var urlPrefixer = require('gulp-css-url-prefixer');

var config = require('config');
var GulpSSH = require('gulp-ssh');

var _config = {
    manifestJsFile: 'manifest-js.json',
    manifestCssFile: 'manifest-css.json'
};

var revjs = new RevAll({
    fileNameManifest: _config.manifestJsFile
});
var revcss = new RevAll({
    fileNameManifest: _config.manifestCssFile
});

gulp.task('sea', function(){
    return gulp.src(['js/mbase/**/*', '!js/mbase/sea.js'], {base: 'js/mbase'})
        .pipe(seatransport({
            idleading: 'tmall/'
        }))
        .pipe(seaconcat({

        }))
        .pipe(gulp.dest('../public/static/js/mbase/tmall'))
        .pipe(revjs.revision())
        .pipe(uglify({
            mangle:{
                except: ['require']
            }
        }))
        .pipe(gulp.dest('../public/static/js/mbase/tmall'))
        .pipe(revjs.manifestFile())
        .pipe(gulp.dest('../public/rev'))
        .pipe(searevmap({
            base: '',
            configFile: '../public/templates/ssi/seajs-config-map.dust',
            prefix: 'tmall/',
            pretty: true
        }))
});

gulp.task('less', function(){
    "use strict";

    return gulp.src('style/less/entries/**/*.less', {
            base: 'style/less/entries'
        })
        .pipe(less())
        .pipe(urlPrefixer(config.get('stylePrefix')))
        .pipe(gulp.dest('../public/static/style/css'))
        .pipe(revcss.revision())
        .pipe(gulp.dest('../public/static/style/css'))
        .pipe(revcss.manifestFile())
        .pipe(gulp.dest('../public/rev'));
});

var gulpSSH = new GulpSSH({
    ignoreErrors: false,
    sshConfig: config.get('serverInfo')
});
gulp.task('ssh-js', function(){
    return gulp.src(['../public/static/js/mbase/tmall/**/*.js'])
        .pipe(gulpSSH.dest(config.get('jsServerPath')));
});

gulp.task('ssh-style', function(){
    return gulp.src(['../public/static/style/**/*'])
        .pipe(gulpSSH.dest(config.get('styleServerPath')));
});

gulp.task('basejs', function() {
    return gulp.src(['js/lib/zepto.js', 'js/lib/sea.js', 'js/common/datareport.js'])
        .pipe(concat('base.js'))
        .pipe(uglify({
            mangle:{
                except: ['require']
            }
        }))
        .pipe(gulp.dest('../public/static/js/mbase/'));
});

gulp.task('copyjslib', function(){
    return gulp.src('js/lib/**/*', {base: 'js/lib'})
        .pipe(gulp.dest('../public/static/js/lib'));
});

gulp.task('copyuihtml', function(){
    return gulp.src(['ui_html/**/*'], {base: 'ui_html'})
        .pipe(gulp.dest('../public/static/ui_html'));
});

gulp.task('copyjsbase', ['copyjslib', 'basejs'], function(cb){
    //console.log('copyjsbase');
    cb();
});

gulp.task('copyimage', function () {
    //console.log('copyimage');
    return gulp.src(['style/img/**/*', 'style/fonts/**/*', 'style/css/**/*'], {base: 'style'})
        .pipe(gulp.dest('../public/static/style'));
});

gulp.task('jsclean', function(){
    //console.log('jsclean');
    return gulp.src(['../public/static/js'])
        .pipe(clean({force: true}));
});

gulp.task('styleclean', function(){
    //console.log('styleclean');
    return gulp.src(['../public/static/style'])
        .pipe(clean({force: true}));
});

gulp.task('clean', gsync.sync(['jsclean', 'styleclean']));

gulp.task('dev-js', gsync.sync(['jsclean', 'copyjsbase', 'sea']));
gulp.task('dev-css', gsync.sync(['styleclean', 'copyuihtml', 'copyimage', 'less']));
gulp.task('dev', gsync.sync(['dev-js', 'dev-css']));