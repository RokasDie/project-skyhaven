var sass = require("gulp-sass");
const autoprefixer = require("autoprefixer");
const gulp = require("gulp");
const browserSync = require("browser-sync");
var nodemon = require("gulp-nodemon");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");

function js() {}

function css(cb) {
  gulp
    .src("./src/scss/*.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./dist/bundles"))
    .pipe(browserSync.stream());
  cb();
}

gulp.task("nodemon", cb => {
  let started = false;
  return nodemon({
    script: "./bin/www"
  }).on("start", () => {
    if (!started) {
      cb();
      started = true;
    }
  });
});

gulp.task(
  "browser-sync",
  gulp.series("nodemon", () => {
    browserSync.init(null, {
      proxy: "http://localhost:3000",
      files: ["src/**/*.*"],

      port: 7000
    });
  })
);

function watch() {
  gulp.watch("./src/scss/**/*", css);
  // We should tell gulp which files to watch to trigger the reload
  // This can be html or whatever you're using to develop your website
  // Note -- you can obviously add the path to the Paths object
  gulp.watch("views/**/*.ejs").on("change", browserSync.reload);
}

// Don't forget to expose the task!
exports.watch = watch;

// Expose the task by exporting it
// This allows you to run it from the commandline using
// $ gulp css
exports.css = css;

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
var build = gulp.parallel(css, watch, "browser-sync");

/*
 * You can still use `gulp.task` to expose tasks
 */
gulp.task("build", build);

/*
 * Define default task that can be called by just running `gulp` from cli
 */
gulp.task("default", build);
