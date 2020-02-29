/*
 * Gulp tasks
 */
const gulp = require('gulp');
const concat = require('gulp-concat');
let uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');


gulp.task('js', function minijs() {
  return gulp.src(['../modules/lazyload.js'])
    .pipe(concat('main.min.js'))
    .then(uglify())
    .on('error', (err) => {
      console.log(err.toString());
    })
    .pipe(gulp.dest("../"))
});

gulp.task("img", function imging() {
  return gulp.src('../../img/**/*.{png,svg,jpg,webp,jpeg,gif}')
    .pipe(imagemin())
    .on('error', (err) => {
      console.log(err.toString());
    })
    .pipe(gulp.dest('../../img/'))
});


gulp.task("default", gulp.series(gulp.parallel('js', 'img')));
