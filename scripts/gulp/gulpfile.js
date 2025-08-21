/*
 * Gulp tasks
 */
import gulp from 'gulp';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify-es';
import imagemin from 'gulp-imagemin';
import {exec} from 'child_process';
import {promisify} from 'util';

const execAsync = promisify(exec);

gulp.task('custom', async function buildWithESBuild() {
    console.log('🔨 Building JavaScript with ESBuild...');
    try {
        const {stdout, stderr} = await execAsync('npm run build', {cwd: '../../'});
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
        console.log('✅ ESBuild completed successfully');
    } catch (error) {
        console.error('❌ ESBuild failed:', error.message);
        throw error;
    }
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

gulp.task('build', async function buildWithESBuild() {
    console.log('🔨 Building JavaScript with ESBuild...');
    try {
        const {stdout, stderr} = await execAsync('npm run build', {cwd: '../../'});
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
        console.log('✅ ESBuild completed successfully');
    } catch (error) {
        console.error('❌ ESBuild failed:', error.message);
        throw error;
    }
});

gulp.task("js", gulp.series(gulp.parallel('custom', 'plugins')));
gulp.task("default", gulp.series(gulp.parallel('js', 'img')));
