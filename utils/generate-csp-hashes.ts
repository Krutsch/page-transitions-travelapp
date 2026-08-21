import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { parse, parseFragment } from "parse5";

interface HtmlNode {
  attrs?: Array<{ name: string; value: string }>;
  childNodes?: HtmlNode[];
  content?: HtmlNode;
  sourceCodeLocation?: {
    endTag?: { startOffset: number };
    startTag?: { endOffset: number };
  };
  tagName?: string;
}

interface Hashes {
  attributes: Set<string>;
  file: string;
  scripts: Set<string>;
}

const buildDirectory = path.resolve("build");
const headersPath = path.join(buildDirectory, "_headers");
const executableScriptTypes = new Set([
  "",
  "application/ecmascript",
  "application/javascript",
  "module",
  "text/ecmascript",
  "text/javascript",
]);

function collectHtmlFiles(directory: string): string[] {
  const files: string[] = [];
  for (const name of fs.readdirSync(directory)) {
    const filePath = path.join(directory, name);
    if (fs.statSync(filePath).isDirectory()) {
      files.push(...collectHtmlFiles(filePath));
    } else if (name.endsWith(".html")) {
      files.push(filePath);
    }
  }
  return files.sort();
}

function hashSource(source: string): string {
  return `'sha256-${createHash("sha256").update(source, "utf8").digest("base64")}'`;
}

function parseHtml(source: string): HtmlNode {
  const isDocument = /^\s*(?:<!doctype\s+html|<html\b)/i.test(source);
  const options = { sourceCodeLocationInfo: true };
  return (isDocument
    ? parse(source, options)
    : parseFragment(source, options)) as unknown as HtmlNode;
}

function visit(node: HtmlNode, source: string, hashes: Hashes): void {
  const attributes = node.attrs ?? [];
  if (node.tagName === "script") {
    const attributeMap = new Map<string, string>(
      attributes.map(({ name, value }) => [name, value]),
    );
    if (attributeMap.has("nonce")) {
      throw new Error(
        `Static build contains a nonce attribute in ${hashes.file}`,
      );
    }

    const type = (attributeMap.get("type") ?? "").trim().toLowerCase();
    if (!attributeMap.has("src") && executableScriptTypes.has(type)) {
      const location = node.sourceCodeLocation;
      if (!location?.startTag || !location.endTag) {
        throw new Error(
          `Unable to locate inline script source in ${hashes.file}`,
        );
      }
      const body = source.slice(
        location.startTag.endOffset,
        location.endTag.startOffset,
      );
      hashes.scripts.add(hashSource(body));
    }
  }

  for (const { name, value } of attributes) {
    if (/^on[a-z]/i.test(name)) hashes.attributes.add(hashSource(value));
  }

  for (const child of node.childNodes ?? []) visit(child, source, hashes);
  if (node.content) visit(node.content, source, hashes);
}

function collectHashes(files: string[]): Hashes {
  const hashes: Hashes = {
    scripts: new Set(),
    attributes: new Set(),
    file: "",
  };
  for (const file of files) {
    hashes.file = path.relative(buildDirectory, file);
    const source = fs.readFileSync(file, "utf8");
    if (/__CSP_NONCE__|\bnonce\s*=/i.test(source)) {
      throw new Error(`Static build contains a nonce marker in ${hashes.file}`);
    }
    visit(parseHtml(source), source, hashes);
  }
  return hashes;
}

function replaceScriptPolicy(headers: string, hashes: Hashes): string {
  const newline = headers.includes("\r\n") ? "\r\n" : "\n";
  const lines = headers.split(/\r?\n/);
  const policyLines = lines.filter((line) =>
    /^\s*Content-Security-Policy\s*:/i.test(line),
  );
  if (policyLines.length !== 1) {
    throw new Error("Expected exactly one Content-Security-Policy header");
  }

  const scriptHashes = [...hashes.scripts].sort();
  const attributeHashes = [...hashes.attributes].sort();
  const scriptSource = ["script-src", "'self'", ...scriptHashes];
  if (attributeHashes.length > 0) {
    scriptSource.push("'unsafe-hashes'", ...attributeHashes);
  }
  const attributeSource =
    attributeHashes.length > 0
      ? ["script-src-attr", "'unsafe-hashes'", ...attributeHashes].join(" ")
      : null;

  const updated = lines.map((line) => {
    const match = line.match(/^(\s*Content-Security-Policy\s*:\s*)(.*)$/i);
    if (!match) return line;

    const originalDirectives = match[2]
      .split(";")
      .map((directive) => directive.trim())
      .filter(Boolean);
    const scriptIndex = originalDirectives.findIndex(
      (directive) =>
        directive.split(/\s+/, 1)[0].toLowerCase() === "script-src",
    );
    if (scriptIndex < 0) throw new Error("CSP is missing script-src");

    const directives = originalDirectives.filter((directive) => {
      const name = directive.split(/\s+/, 1)[0].toLowerCase();
      return name !== "script-src" && name !== "script-src-attr";
    });
    const insertionIndex = Math.min(scriptIndex, directives.length);
    directives.splice(insertionIndex, 0, scriptSource.join(" "));
    if (attributeSource)
      directives.splice(insertionIndex + 1, 0, attributeSource);
    return `${match[1]}${directives.join("; ")}`;
  });

  const result = updated.join(newline);
  if (/nonce-|__CSP_NONCE__/i.test(result)) {
    throw new Error("Generated static CSP still contains a nonce");
  }
  return result;
}

function writeAtomically(filePath: string, contents: string): void {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, contents, "utf8");
    fs.renameSync(temporaryPath, filePath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
}

if (!fs.existsSync(headersPath)) throw new Error(`Missing ${headersPath}`);
const htmlFiles = collectHtmlFiles(buildDirectory);
if (htmlFiles.length === 0) {
  throw new Error(`No HTML files found in ${buildDirectory}`);
}
const hashes = collectHashes(htmlFiles);
const headers = fs.readFileSync(headersPath, "utf8");
writeAtomically(headersPath, replaceScriptPolicy(headers, hashes));
console.log(
  `Generated CSP for ${htmlFiles.length} HTML files: ${hashes.scripts.size} inline scripts, ${hashes.attributes.size} inline event handlers`,
);
