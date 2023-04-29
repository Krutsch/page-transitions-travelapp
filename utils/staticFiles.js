import { mkdirSync, copyFileSync, writeFileSync, readFileSync } from "fs";
import sharp from "sharp";
import minifyJSON from "node-json-minify";

const SOURCE_FOLDER = "src";
const BUILD_FOLDER = "build";
const file = process.argv[2];

if (
  ["src/_headers", "src/_redirects"].includes(file) ||
  file.endsWith(".ico") ||
  file.endsWith(".woff2") ||
  file.endsWith("robots.txt") ||
  (file.endsWith(".png") && file.includes("icon"))
) {
  copyFile(file);
} else if (file.endsWith(".json")) {
  writeFileSync(
    getBuildPath(file),
    minifyJSON(readFileSync(file, { encoding: "utf-8" }))
  );
} else if (file.endsWith(".jpg")) {
  imgHandler(file, ".jpg");
} else if (file.endsWith(".png") && !file.includes("icon")) {
  imgHandler(file, ".png");
}

console.log(`finished handling ${file}`);

function copyFile(file) {
  const buildPath = createDir(file);
  copyFileSync(file, buildPath);
}

function imgHandler(file, ext) {
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
