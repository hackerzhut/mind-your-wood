/* gulpfile.js */
 
// Load some modules which are installed through NPM.
var gulp        = require('gulp'),
    browserify  = require('browserify'),
    uglify      = require('gulp-uglify'),
    del         = require('del'),
    babelify    = require('babelify'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    nodemon     = require('gulp-nodemon'),
    watchify    = require("watchify"),
    concat      = require('gulp-concat'),
    sass        = require('gulp-ruby-sass') ,
    bower       = require('gulp-bower'),
    serve       = require('gulp-serve');


// Define some paths.
var paths = {
  sassPath: './',
  bowerDir: './bower_components' ,
  css:      ['./*.css'],
  app_js:   ['./src/app.jsx'],
  js:       ['./src/*.js'],
  html:     ['./src/index.html'],
  dest:     './build'
};

gulp.task('bower', function() { 
    return bower()
        .pipe(gulp.dest(config.bowerDir)) 
});
 
// An example of a dependency task, it will be run before the css/js tasks.
// Dependency tasks should call the callback to tell the parent task that
// they're done.
gulp.task('clean', function(done) {
  del([paths.dest + '/**/*.*'], done);
});

// Copy html
gulp.task('copy', function(){
  return gulp.src(paths.html)
    .pipe(gulp.dest(paths.dest));
});
 
gulp.task('css', function() { 
   return sass('./index.scss', {
      loadPath: [ paths.bowerDir + '/bootstrap-sass-official/assets/stylesheets'],
      style: 'compressed'
      //bundleExec: true
    }).on('error', function(e) {
      console.log(e);
    })
    .pipe(concat('build.css'))
    .pipe(gulp.dest(paths.dest));      
});

 
// Our JS task. It will Browserify our code and compile React JSX files.
gulp.task('js', function() {
  // Browserify/bundle the JS.
   return browserify({
            entries: './src/app.jsx', 
            extensions: ['.jsx'], 
            transform: [babelify],
            insertGlobals: true,
            debug: true,
            //cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
         })
        //.transform(babelify)
        .bundle()
        .pipe(source('build.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest(paths.dest));
});
 
// Rerun tasks whenever a file changes.
gulp.task('watch', function() {
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.js, ['js']);
  gulp.watch(paths.app_js, ['js']);
});


/*gulp.task('serve', function() {
  var express = require('express');
  var port = process.env.port || 3000
  express()
    .use(express.static(__dirname))
    .listen(port)
});*/

gulp.task('serve', serve({
  root: ['html', 'build'],
  port: process.env.port || 3000
}));
 

// The default task (called when we run `gulp` from cli)
gulp.task('default', ['watch', 'clean', 'css', 'js', 'copy']);
gulp.task('build', ['clean', 'css', 'js', 'copy', 'serve']);


gulp.task('heroku:production', ['build']);
