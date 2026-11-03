const crypto = require("crypto");
const AdmZip = require("adm-zip");
const httpError = require("../utils/httpError");

const MAX_ZIP_ENTRIES = 500;
const MAX_ZIP_UNCOMPRESSED_BYTES = 200 * 1024 * 1024;

// Heuristics for what a notebook reads and writes (they match string-literal file names in code cells)
const INPUT_RE = /(?:read_\w+|load\w*|open)\(\s*[rbf]*["']([^"'\n]+)["']/g;
const OUTPUT_RE = /(?:to_\w+|savefig|save\w*|dump)\(\s*[rbf]*["']([^"'\n]+)["']/g;

const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
const extOf = (name) => (name.includes(".") ? name.split(".").pop().toLowerCase() : "");
const baseName = (p) => p.split(/[\\/]/).pop();

/** Lists every file in a zip with its hash. Guards against huge archives. */
const inspectZip = (buffer) => {
  let zip;
  try {
    zip = new AdmZip(buffer);
  } catch {
    throw httpError(400, "Could not read this zip file");
  }
  const entries = zip
    .getEntries()
    .filter((e) => !e.isDirectory && !e.entryName.startsWith("__MACOSX/"));

  if (entries.length > MAX_ZIP_ENTRIES) {
    throw httpError(400, `Zip contains more than ${MAX_ZIP_ENTRIES} files`);
  }
  const declaredSize = entries.reduce((sum, e) => sum + e.header.size, 0);
  if (declaredSize > MAX_ZIP_UNCOMPRESSED_BYTES) {
    throw httpError(400, "Zip is too large once extracted");
  }

  return entries.map((e) => {
    const data = e.getData();
    return { path: e.entryName, sha256: sha256(data), size: data.length, origin: "zip-entry" };
  });
};

/**
 * Reads a notebook: hashes every embedded output image, and collects the
 * file names its code reads (inputs) and writes (outputs).
 */
const inspectNotebook = (buffer) => {
  let nb;
  try {
    nb = JSON.parse(buffer.toString("utf8"));
  } catch {
    throw httpError(400, "Notebook is not valid JSON");
  }

  const artifacts = [];
  const inputFiles = new Set();
  const outputFiles = new Set();

  (nb.cells || []).forEach((cell, ci) => {
    if (cell.cell_type !== "code") return;

    const source = Array.isArray(cell.source) ? cell.source.join("") : cell.source || "";
    for (const m of source.matchAll(INPUT_RE)) inputFiles.add(baseName(m[1]));
    for (const m of source.matchAll(OUTPUT_RE)) outputFiles.add(baseName(m[1]));

    (cell.outputs || []).forEach((output, oi) => {
      for (const mime of ["image/png", "image/jpeg"]) {
        const raw = output.data && output.data[mime];
        if (!raw) continue;
        const image = Buffer.from(Array.isArray(raw) ? raw.join("") : raw, "base64");
        artifacts.push({
          path: `cell ${ci} output ${oi} (${mime})`,
          sha256: sha256(image),
          size: image.length,
          origin: "notebook-output",
        });
      }
    });
  });

  return { artifacts, inputFiles: [...inputFiles], outputFiles: [...outputFiles] };
};

/**
 * Fingerprints an upload. Runs BEFORE the file is stored, so a corrupt
 * zip or notebook is rejected without leaving an orphan file in GridFS.
 */
exports.inspectUpload = (buffer, fileName) => {
  const ext = extOf(fileName);
  const result = { contentHash: sha256(buffer), artifacts: [], notebook: null };

  if (ext === "zip") {
    result.artifacts = inspectZip(buffer);
  } else if (ext === "ipynb") {
    result.notebook = inspectNotebook(buffer);
    result.artifacts = result.notebook.artifacts;
  }
  return result;
};

exports.hashBuffer = sha256;