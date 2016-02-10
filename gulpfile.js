var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('scripts', function() {
    gulp.src([
        'Resources/public/vendor/jquery/dist/jquery.min.js',
        'Resources/public/vendor/bootstrap/dist/js/bootstrap.min.js',
        'Resources/public/vendor/chosen/chosen.jquery.min.js',
        'Resources/public/vendor/highcharts/highcharts.js',
        'Resources/public/vendor/highcharts/modules/exporting.js',
        'Resources/public/js/dashboard.js',
        'Resources/public/js/dashboard/cpu.js',
        'Resources/public/js/dashboard/memory.js',
        'Resources/public/js/dashboard/network.js',
    ]).pipe(concat('scripts.js')).pipe(gulp.dest('Resources/public/dist/js'));
});

gulp.task('stylesheets', function() {
    gulp.src([
        'Resources/public/vendor/bootstrap/dist/css/bootstrap.min.css',
        'Resources/public/vendor/chosen/chosen.min.css',
        'Resources/public/css/styles.css'
    ]).pipe(concat('styles.css')).pipe(gulp.dest('Resources/public/dist/css'));
    gulp.src(
        'Resources/public/vendor/bootstrap/fonts/*'
    ).pipe(gulp.dest('Resources/public/dist/fonts'));
    gulp.src(
        'Resources/public/vendor/chosen/chosen-sprite*.png'
    ).pipe(gulp.dest('Resources/public/dist/css'));
});

gulp.task('watch', function() {
    gulp.watch('Resources/**/*.js', ['scripts']);
    gulp.watch('Resources/**/*.css', ['stylesheets']);
});

gulp.task('default', ['scripts', 'stylesheets', 'watch']);

