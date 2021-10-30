import {
  mkdirSync,
  copyFileSync,
  rmSync,
  writeFileSync,
  readFileSync,
} from "fs";
import glob from "glob";
import sharp from "sharp";
import minifyJSON from "node-json-minify";

const SOURCE_FOLDER = "src";
const BUILD_FOLDER = "build";

// Remove old build folder
rmSync(BUILD_FOLDER, { recursive: true, force: true });

glob("src/**/*.!(js|ts|html|css)", {}, (err, files) => {
  if (err) console.error(err);

  copyFiles(["src/_headers", "src/_redirects"]);
  copyFiles(files.filter((f) => f.endsWith(".ico")));
  copyFiles(files.filter((f) => f.endsWith(".woff2")));
  jsonHandler(files.filter((f) => f.endsWith(".json")));
  imgHandler(
    files.filter((f) => f.endsWith(".jpg")),
    ".jpg"
  );
  imgHandler(
    files.filter((f) => f.endsWith(".png") && !f.includes("icon")),
    ".png"
  );
  copyFiles(
    files.filter(
      (f) =>
        f.endsWith("robots.txt") || (f.endsWith(".png") && f.includes("icon"))
    )
  );

  console.log(`🛠️  Pre-build finished.`);
});

function copyFiles(files) {
  files.forEach(copyFile);
}

function jsonHandler(files) {
  files.forEach((file) =>
    writeFileSync(
      getBuildPath(file),
      minifyJSON(readFileSync(file, { encoding: "utf-8" }))
    )
  );
}

function copyFile(file) {
  const buildPath = createDir(file);
  copyFileSync(file, buildPath);
}

function imgHandler(files, ext) {
  for (const file of files) {
    const buildPath = createDir(file);
    sharp(file)
      .webp({
        quality: 80,
      })
      .toFile(buildPath.replace(ext, ".webp"))
      .catch((err) => {
        console.error(err);
      });

    // Create Preview Image
    sharp(file)
      .webp({
        quality: 10,
      })
      .toFile(toPreviewImage(file).replace(ext, ".webp"))
      .catch((err) => {
        console.error(err);
      });
  }
}

function getBuildPath(file) {
  return file.replace(`${SOURCE_FOLDER}/`, `${BUILD_FOLDER}/`);
}

function createDir(file) {
  const buildPath = getBuildPath(file);
  const dir = buildPath.split("/").slice(0, -1).join("/");
  mkdirSync(dir, { recursive: true });
  return buildPath;
}

function toPreviewImage(file) {
  const buildPath = getBuildPath(file);
  const dir = buildPath.split("/");
  const base = dir.pop();
  dir.push(base.replace(/(.*)?\./, "$1-preview."));
  return dir.join("/");
}
