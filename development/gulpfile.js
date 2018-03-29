var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var minify = require('gulp-minify-css');
var smartgrid = require('smart-grid');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var gwatch = require('gulp-watch');
var pump = require('pump');
var rsync = require('gulp-rsync');
var buffer = require('vinyl-buffer');
var tiny = require('gulp-tinypng-nokey');
var newer = require('gulp-newer');



gulp.task('browserSync', function() {
    browserSync({
      server: {
        baseDir: '../share'
      },
        //proxy: "siteName/",
        notify: false
    });
});

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        
        js: '../share/js/',
        css: '../share/css/',
        img: '../share/img/',
        fonts: '../share/fonts/',     
        
        
    },
    src: { //Пути откуда брать исходники
        
        js: ['jslib/**/*.js', 'js/**/*.js'],
        jshint: 'js/**/*.js',
        sass: 'sass/style.sass',
        css: 'css/*.css',
        img: ['img/**/*.*'], 
        fonts: 'fonts/**/*.*',
        
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: ['../share/**/*.html'],
        js: ['jslib/**/*.js', 'js/**/*.js'],
        css: 'css/*.css',
        sass: 'sass/**/*.sass',
        img: 'img/**/*.*',
        fonts: 'fonts/**/*.*',
        
    },
    clean: '../share', //директории которые могут очищаться
};

gulp.task('html:build', function () {
    browserSync.reload();
});

// проверка js на ошибки и вывод их в консоль
gulp.task('jshint:build', function() {
    return gulp.src(path.src.jshint) //выберем файлы по нужному пути
        .pipe(jshint()) //прогоним через jshint
        .pipe(jshint.reporter('jshint-stylish')); //стилизуем вывод ошибок в консоль
});

// билдинг яваскрипта
gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(concat('app.js'))
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(rename({suffix: '.min'})) //добавим суффикс .min к выходному файлу
        .pipe(gulp.dest(path.build.js)); //выгрузим готовый файл в build       
        browserSync.reload();
});


gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        //.pipe(changed('imageBuilding'))
        .pipe(newer(path.build.img))
        .pipe(tiny())
        .pipe(gulp.dest(path.build.img)); //выгрузим в build
        browserSync.reload();//перезагрузим сервер
});

// обработка sass
gulp.task('sass:build', function(){
  gulp.src('sass/style.sass')
  .pipe(sass())
  .pipe(gulp.dest('css'))
});


// билдинг пользовательского css
gulp.task('css:build', function () {
    gulp.src(path.src.css) //Выберем наш основной файл стилей
        .pipe(sourcemaps.init()) //инициализируем soucemap
        .pipe(autoprefixer({
            browsers: ['>0.01%'],
            cascade: false
        }))
        .pipe(concat('style.css')) //соединим
        .pipe(minify())
        .pipe(sourcemaps.write()) //пропишем sourcemap
        .pipe(rename({suffix: '.min'})) //добавим суффикс .min к имени выходного файла
        .pipe(gulp.dest(path.build.css)); //вызгрузим в build
        browserSync.reload(); //перезагрузим сервер
});


// билдим шрифты
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts)) //выгружаем в build
});

// билдим все
gulp.task('build', [
    'jshint:build',
    'js:build',
    'sass:build',   
    'css:build',    
    'fonts:build',
    'image:build',
]);


// watch
gulp.task('watch', ['browserSync'], function(){
     //билдим html в случае изменения
    gwatch(path.watch.html, function(event, cb) {
        gulp.start('html:build');
    });    
      //билдим sass в случае изменения
    gwatch([path.watch.sass], function(event, cb) {
        gulp.start('sass:build');
    });

     //билдим css в случае изменения
    gwatch([path.watch.css], function(event, cb) {
        gulp.start('css:build');
    });

     //проверяем js в случае изменения
    gwatch(path.watch.js, ['jshint']);
     //билдим js в случае изменения
    gwatch(path.watch.js, function(event, cb) {
        gulp.start('js:build');
    });
     //билдим статичные изображения в случае изменения
    gwatch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
     //билдим шрифты в случае изменения
    gwatch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    
});

gulp.task('default', ['build', 'watch']);

gulp.task('deploy', function() {   
    return gulp.src(['../share/**'])
    .pipe(rsync({
        root: '/destination/',
        hostname: 'user@host',
        destination: 'full/destination/root',
        archive: true,
        silent: false,
        compress: true,
    }));
});

gulp.task('uglify-error-debugging', function (cb) {
  pump([
    gulp.src('/js/**/*.js'),
    uglify(),
    gulp.dest('/uglify/')
  ], cb);
});













/* It's principal settings in smart grid project */
var settings = {
    outputStyle: 'sass', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: '20px', /* gutter width px || % */
    mobileFirst: false, /* mobileFirst ? 'min-width' : 'max-width' */
    container: {
        maxWidth: '1280px', /* max-width оn very large screen */
        fields: '40px' /* side fields */
        
    },
    breakPoints: {
        lg: {
            width: '1200px', /* -> @media (max-width: 1100px) */
            fields: '40px'
        },
        md: {
            width: '960px',
            fields: '20px'
            
        },
        sm: {
            width: '780px',
            fields: '20px'  
        },
        
        xs: {
            width: '600px',
            fields: '20px'
        },
        xss: {
            width: '380px',
            fields: '20px'
        }
        /* 
        We can create any quantity of break points.

        some_name: {
            width: 'Npx',
            fields: 'N(px|%|rem)',
            offset: 'N(px|%|rem)'
        }
        */
    }
};

gulp.task('grid', function(){
  smartgrid('sass', settings);
});
