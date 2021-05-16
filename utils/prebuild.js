import { mkdirSync, copyFileSync, rmSync } from "fs";
import glob from "glob";
import sharp from "sharp";

const SOURCE_FOLDER = "src";
const BUILD_FOLDER = "build";

// Remove old build folder
rmSync(BUILD_FOLDER, { recursive: true, force: true });

glob("src/**/*.!(js|ts|html|css)", {}, (err, files) => {
  if (err) console.error(err);

  copyFiles(["src/_headers", "src/_redirects"]);
  copyFiles(files.filter((f) => f.endsWith(".ico")));
  jpgHandler(files.filter((f) => f.endsWith(".jpg")));
  pngHandler(files.filter((f) => f.endsWith(".png")));

  console.log(`🛠️  Pre-build finished.`);
});

function copyFiles(files) {
  files.forEach(copyFile);
}

function copyFile(file) {
  const buildPath = createDir(file);
  copyFileSync(file, buildPath);
}

function jpgHandler(files) {
  for (const file of files) {
    const buildPath = createDir(file);
    sharp(file)
      .jpeg({
        quality: 80,
      })
      .toFile(buildPath)
      .catch((err) => {
        console.error(err);
      });

    // Create Preview Image
    sharp(file)
      .jpeg({
        quality: 10,
      })
      .toFile(toPreviewImage(file))
      .catch((err) => {
        console.error(err);
      });
  }
}
function pngHandler(files) {
  for (const file of files) {
    const buildPath = createDir(file);
    sharp(file)
      .png({
        quality: 80,
      })
      .toFile(buildPath)
      .catch((err) => {
        console.error(err);
      });

    // Create Preview Image
    sharp(file)
      .png({
        quality: 10,
      })
      .toFile(toPreviewImage(file))
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
