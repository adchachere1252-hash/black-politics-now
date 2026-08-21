import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".manus-logs",
  "node_modules",
  "dist",
  ".cache",
]);
const imageExtensions = new Set([".avif", ".gif", ".ico", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);
const textExtensions = new Set([".css", ".html", ".json", ".md", ".mjs", ".ts", ".tsx"]);
const assetMapPattern = /(candidate|portrait|photo|image|asset)/i;
const placeholderPattern = /\b(placeholder|fallback|default image|avatar|skeleton|no image|missing image)\b/i;

async function walk(directory, files = []) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(absolute, files);
    } else if (entry.isFile()) {
      files.push(absolute);
    }
  }
  return files;
}

function rel(absolute) {
  return path.relative(root, absolute).split(path.sep).join("/");
}

function countOccurrences(text, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(escaped, "g")) ?? []).length;
}

const allFiles = await walk(root);
const localImages = allFiles.filter((file) => imageExtensions.has(path.extname(file).toLowerCase()));
const textFiles = allFiles.filter((file) => textExtensions.has(path.extname(file).toLowerCase()));

const textFileContents = await Promise.all(textFiles.map(async (file) => ({
  file: rel(file),
  content: await fs.readFile(file, "utf8"),
})));
const allSourceText = textFileContents.map(({ content }) => content).join("\n");

const localAssetInventory = await Promise.all(localImages.map(async (file) => {
  const stat = await fs.stat(file);
  const filename = path.basename(file);
  const references = textFileContents
    .filter(({ file: sourceFile }) => sourceFile !== rel(file))
    .reduce((total, { content }) => total + countOccurrences(content, filename), 0);
  return {
    path: rel(file),
    filename,
    bytes: stat.size,
    references,
  };
}));

const assetMapFiles = textFiles
  .map(rel)
  .filter((file) => assetMapPattern.test(path.basename(file)))
  .filter((file) => /^(client|server|shared|scripts)\//.test(file));

const placeholderMarkers = textFileContents.flatMap(({ file, content }) => content
  .split("\n")
  .map((line, index) => ({ line, index }))
  .filter(({ line }) => placeholderPattern.test(line))
  .map(({ line, index }) => ({
    file,
    line: index + 1,
    excerpt: line.trim().slice(0, 180),
  })))
  .filter(({ file }) => /^(client|server)\//.test(file));

const remoteReferences = {
  manusStorage: (allSourceText.match(/\/manus-storage\//g) ?? []).length,
  httpImageLike: (allSourceText.match(/https?:\/\/[^\s"'`<>]+\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#][^\s"'`<>]*)?/gi) ?? []).length,
  bioguide: (allSourceText.match(/bioguide:/g) ?? []).length,
  clerkHouse: (allSourceText.match(/clerk\.house\.gov\/images\/members/g) ?? []).length,
};

const report = {
  root,
  localImages: {
    count: localAssetInventory.length,
    inClientPublic: localAssetInventory.filter(({ path: file }) => file.startsWith("client/public/")).length,
    unlinked: localAssetInventory.filter(({ references }) => references === 0),
    inventory: localAssetInventory,
  },
  assetMapFiles,
  remoteReferences,
  placeholderMarkers,
  note: "Read-only audit. A marker is a code-level fallback or loading-state reference, not automatically a public broken-image defect.",
};

const imageSpecificPlaceholders = placeholderMarkers.filter(({ excerpt }) => /image|portrait|photo|avatar|no image|missing image/i.test(excerpt));

if (process.argv.includes("--summary")) {
  console.log(JSON.stringify({
    localImages: {
      count: report.localImages.count,
      inClientPublic: report.localImages.inClientPublic,
      unlinked: report.localImages.unlinked,
    },
    assetMapFileCount: assetMapFiles.length,
    activeCandidatePortraitMapFiles: assetMapFiles.filter((file) => /candidatephotos|portrait|verifiedphotos/i.test(file)),
    remoteReferences,
    placeholderMarkerCount: placeholderMarkers.length,
    imageSpecificPlaceholders,
    note: report.note,
  }, null, 2));
} else {
  console.log(JSON.stringify(report, null, 2));
}
