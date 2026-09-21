// src/utils/compressFiles.js
//
// Compresses uploaded files IN PLACE (same path, same extension), so the
// paths already saved in MongoDB stay valid.
//
//   images (jpg/jpeg/png/webp) -> sharp
//   pdf                        -> Ghostscript (must be installed on the server)
//
// Requirements:
//   npm i sharp
//   Linux:   sudo apt install ghostscript
//   Windows: install Ghostscript and make sure gswin64c is in PATH
//   macOS:   brew install ghostscript

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const sharp = require("sharp");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileP = promisify(execFile);

const MAX_WIDTH = 1920; // images wider than this are scaled down
const IMAGE_QUALITY = 75;
const GS_BIN = process.platform === "win32" ? "gswin64c" : "gs";
// /screen = smallest, /ebook = balanced (recommended), /printer = high quality
const PDF_SETTINGS = "/ebook";
const PDF_TIMEOUT_MS = 90 * 1000;

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"];

// tmp file keeps the original extension (sharp/gs need it)
const tmpPathFor = (filePath) =>
    path.join(path.dirname(filePath), `tmp_${Date.now()}_${path.basename(filePath)}`);

// only replace the original if the compressed version is actually smaller
const replaceIfSmaller = async (original, tmp) => {
    const [a, b] = await Promise.all([fsp.stat(original), fsp.stat(tmp)]);
    if (b.size > 0 && b.size < a.size) {
        await fsp.rename(tmp, original);
        return { before: a.size, after: b.size };
    }
    await fsp.unlink(tmp).catch(() => { });
    return { before: a.size, after: a.size };
};

const compressImage = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const tmp = tmpPathFor(filePath);

    let pipeline = sharp(filePath, { failOn: "none" })
        .rotate() // apply EXIF orientation, then metadata is dropped
        .resize({ width: MAX_WIDTH, withoutEnlargement: true });

    if (ext === ".png") {
        pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality: IMAGE_QUALITY });
    } else if (ext === ".webp") {
        pipeline = pipeline.webp({ quality: IMAGE_QUALITY });
    } else {
        pipeline = pipeline.jpeg({ quality: IMAGE_QUALITY, mozjpeg: true });
    }

    await pipeline.toFile(tmp);
    return replaceIfSmaller(filePath, tmp);
};

const compressPdf = async (filePath) => {
    const tmp = tmpPathFor(filePath);

    await execFileP(
        GS_BIN,
        [
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.4",
            `-dPDFSETTINGS=${PDF_SETTINGS}`,
            "-dNOPAUSE",
            "-dQUIET",
            "-dBATCH",
            `-sOutputFile=${tmp}`,
            filePath,
        ],
        { timeout: PDF_TIMEOUT_MS }
    );

    return replaceIfSmaller(filePath, tmp);
};

// Never throws: if compression fails, the original file is left untouched.
const compressFile = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    try {
        if (IMAGE_EXT.includes(ext)) return await compressImage(filePath);
        if (ext === ".pdf") return await compressPdf(filePath);
    } catch (err) {
        console.error(`Compression failed for ${filePath}:`, err.message);
    }
    return null;
};

// Compress many files with limited concurrency (PDF compression is CPU heavy)
const compressFiles = async (files = [], concurrency = 2) => {
    const queue = files.map((f) => f.path);
    const workers = Array.from(
        { length: Math.min(concurrency, queue.length) },
        async () => {
            while (queue.length) {
                await compressFile(queue.shift());
            }
        }
    );
    await Promise.all(workers);
};

module.exports = { compressFile, compressFiles };