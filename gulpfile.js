import gulp from "gulp";
import browserSync from "browser-sync";
import cleanCSS from "gulp-clean-css";
import autoprefixer from "gulp-autoprefixer";
import rename from "gulp-rename";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import imagemin from "gulp-imagemin";
import htmlmin from "gulp-htmlmin";
import webp from "gulp-webp";
import newer from "gulp-newer";
import webpHtmlNosvg from "gulp-webp-html-nosvg";
import versionNumber from "gulp-version-number";
import terser from "gulp-terser";
import sourcemaps from "gulp-sourcemaps";

const sass = gulpSass(dartSass);
const bs = browserSync.create();

const paths = {
  html: "src/*.html",
  styles: "src/scss/**/*.+(scss|sass)",
  stylesWatch: "src/scss/**/*.+(scss|sass|css)",
  scripts: "src/js/**/*.js",
  rasterImages: "src/img/**/*.{jpg,jpeg,png,webp}",
  allImages: "src/img/**/*.{jpg,jpeg,png,webp,gif,svg}",
  staticImages: "src/img/**/*.{gif,svg}",
};

const reload = (done) => {
  bs.reload();
  done();
};

function server() {
  bs.init({
    server: {
      baseDir: "dist",
    },
  });
}

function serverOnly(done) {
  server();
  done();
}

function stylesDev() {
  return gulp
    .src(paths.styles)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(rename({ basename: "styles", suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/css"))
    .pipe(bs.stream());
}

function stylesBuild() {
  return gulp
    .src(paths.styles)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(rename({ basename: "styles", suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/css"));
}

function htmlDev() {
  return gulp.src(paths.html).pipe(gulp.dest("dist/"));
}

function htmlBuild() {
  return gulp
    .src(paths.html)
    .pipe(webpHtmlNosvg())
    .pipe(
      versionNumber({
        value: "%DT%",
        append: {
          key: "_v",
          cover: 0,
          to: ["css", "js"],
        },
        output: {
          file: "version.json",
        },
      }),
    )
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("dist/"));
}

function scriptsDev() {
  return gulp
    .src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/js"));
}

function scriptsBuild() {
  return gulp
    .src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/js"));
}

function imagesDevOriginals() {
  return gulp
    .src(paths.allImages, { encoding: false })
    .pipe(newer("dist/img"))
    .pipe(gulp.dest("dist/img"));
}

function imagesDevWebp() {
  return gulp
    .src("src/img/**/*.{jpg,jpeg,png}", { encoding: false })
    .pipe(webp())
    .pipe(gulp.dest("dist/img"));
}

const imagesDev = gulp.parallel(imagesDevOriginals, imagesDevWebp);

function imagesBuildOriginals() {
  return gulp
    .src(paths.allImages, { encoding: false })
    .pipe(newer("dist/img"))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3,
      }),
    )
    .pipe(gulp.dest("dist/img"));
}

function imagesBuildWebp() {
  return gulp
    .src("src/img/**/*.{jpg,jpeg,png}", { encoding: false })
    .pipe(webp())
    .pipe(gulp.dest("dist/img"));
}

const imagesBuild = gulp.parallel(imagesBuildOriginals, imagesBuildWebp);

function watchFiles() {
  gulp.watch(paths.stylesWatch, stylesDev);
  gulp.watch(paths.html, gulp.series(htmlDev, reload));
  gulp.watch(paths.scripts, gulp.series(scriptsDev, reload));
  gulp.watch(paths.allImages, gulp.series(imagesDev, reload));
}

const devAssets = gulp.parallel(stylesDev, scriptsDev, htmlDev, imagesDev);
const buildAssets = gulp.parallel(
  stylesBuild,
  scriptsBuild,
  htmlBuild,
  imagesBuild,
);

gulp.task("server", server);
gulp.task("serverOnly", serverOnly);
gulp.task("watch", watchFiles);

gulp.task("styles:dev", stylesDev);
gulp.task("styles:build", stylesBuild);
gulp.task("html:dev", htmlDev);
gulp.task("html:build", htmlBuild);
gulp.task("scripts:dev", scriptsDev);
gulp.task("scripts:build", scriptsBuild);
gulp.task("images:dev", imagesDev);
gulp.task("images:build", imagesBuild);

gulp.task("dev", gulp.series(devAssets, gulp.parallel(server, watchFiles)));
gulp.task("build", buildAssets);
gulp.task("default", gulp.series("dev"));
