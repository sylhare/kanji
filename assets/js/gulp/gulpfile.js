/*
 * Gulp tasks
 */
const gulp = require('gulp');
const concat = require('gulp-concat');
let uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');


gulp.task('custom', function minijs() {
  return gulp.src(['../modules/*.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .on('error', (err) => {
      console.log(err.toString());
    })
    .pipe(gulp.dest("../"))
});

gulp.task('plugins', function miniVendorjs() {
  return gulp.src(['../plugins/^((?!min).)*$'])
    .pipe(concat('plugins.min.js'))
    .pipe(uglify())
    .on('error', (err) => {
      console.log(err.toString());
    })
    .pipe(gulp.dest("../plugins/"))
});

gulp.task("img", function imging() {
  return gulp.src('../../img/**/*.{png,svg,jpg,webp,jpeg,gif}')
    .pipe(imagemin())
    .on('error', (err) => {
      console.log(err.toString());
    })
    .pipe(gulp.dest('../../img/'))
});

gulp.task("js", gulp.series(gulp.parallel('custom', 'plugins')));
gulp.task("default", gulp.series(gulp.parallel('js', 'img')));
