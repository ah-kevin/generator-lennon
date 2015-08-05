/*global -$ */
'use strict';
// generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('styles', function () {<% if (includeSass) { %>
  return gulp.src('app/styles/*.scss')
      .pipe($.plumber())
      .pipe($.sourcemaps.init())
      .pipe($.sass.sync({
        outputStyle: 'expanded',
        precision: 10,
        includePaths: ['.']
      }).on('error', $.sass.logError))<% } else if(includeCompass){ %>
    return  gulp.src('app/styles/*.scss')
            .pipe($.plumber({
                errorHandler: function (error) {
                    console.log(error.message);
                    this.emit('end');
                }}))
            .pipe($.sourcemaps.init())
            .pipe($.compass({
                css: 'app/styles/_css',
                sass: 'app/styles/',
                image: 'app/images'
            }))
            .on('error', function(err) {
                console.log(err);
            })
  <% }else{ %>
  return gulp.src('app/styles/*.css')
          .pipe($.sourcemaps.init())<% } %>
       .pipe($.autoprefixer({browsers: ['last 1 version']}))
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('.tmp/styles'))
      .pipe(reload({stream: true}));
});


gulp.task('html', [<% if (includeCocos2djs) { %>'js',<% } %>'styles'], function () {
  var assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

<% if(includeCocos2djs){ %>

  gulp.task('js', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.concat('main.js'))
        .pipe(gulp.dest('.tmp/scripts'))
        .pipe(reload({stream: true}));
  });
<% } %>

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
      .pipe($.if($.if.isFile, $.cache($.imagemin({
        progressive: true,
        interlaced: true,
        // don't remove IDs from SVGs, they are often used
        // as hooks for embedding and styling
        svgoPlugins: [{cleanupIDs: false}]
      }))
          .on('error', function(err){ console.log(err); this.end; })))
      .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')({
    filter: '**/*.{eot,svg,ttf,woff,woff2}'
  }).concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('serve', [<% if (includeCocos2djs) { %>'js',<% } %>'styles', 'fonts'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  // watch for changes
  gulp.watch([
    'app/*.html',
    <% if (includeCocos2djs) { %>
    '.tmp/scripts/**/*.js',
        <% } else { %>
    'app/scripts/**/*.js',
        <% } %>
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  <% if (includeCocos2djs) { %>
    gulp.watch('app/scripts/**/*.js', ['js']);
  <% } %>
  gulp.watch('app/styles/**/*.<%= includeSass || includeCompass ? 'scss' : 'css' %>', ['styles']);
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;
  <% if (includeSass) { %>
    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
          ignorePath: /^(\.\.\/)+/
        }))
        .pipe(gulp.dest('app/styles'));
  <% } %>
  gulp.src('app/*.html')
      .pipe(wiredep({<% if ((includeSass||includeCompass)&& includeBootstrap) { %>
    exclude: ['bootstrap-sass'],<% } %>
  ignorePath: /^(\.\.\/)*\.\./
}))
.pipe(gulp.dest('app'));
});

gulp.task('build', [ 'html', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

