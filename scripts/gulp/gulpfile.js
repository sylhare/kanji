/*
 * Gulp tasks
 */
import gulp from 'gulp';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify-es';
import imagemin from 'gulp-imagemin';


gulp.task('custom', function minijs() {
  return gulp.src(['../../assets/js/modules/*.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify.default())
    .on('error', (err) => {
      console.log(err.toString());
    })
    .pipe(gulp.dest("../../assets/js/"))
});

gulp.task('plugins', function miniVendorjs() {
  return gulp.src(['../../assets/js/plugins/^((?!min).)*$'])
    .pipe(concat('plugins.min.js'))
    .pipe(uglify.default())
    .on('error', (err) => {
      console.log(err.toString());
    })
    .pipe(gulp.dest("../../assets/js/plugins/"))
});

gulp.task("img", function imging() {
  return gulp.src('../../assets/img/**/*.{png,svg,jpg,webp,jpeg,gif}')
    .pipe(imagemin())
    .on('error', (err) => {
      console.log(err.toString());
    })
    .pipe(gulp.dest('../../assets/img/'))
});

gulp.task('build', function buildjs() {
  return gulp.src(['../../assets/js/modules/*.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify.default())
    .on('error', (err) => {
      console.log(err.toString());
    })
    .pipe(gulp.dest("../../assets/js/"))
});

gulp.task("js", gulp.series(gulp.parallel('custom', 'plugins')));
gulp.task("default", gulp.series(gulp.parallel('js', 'img')));
