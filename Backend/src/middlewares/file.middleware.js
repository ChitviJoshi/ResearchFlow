// Multer + GridFS storage middleware for handling PDF/dataset uploads
/**
 * Placeholder file upload middleware..
 */


const multer = require("multer");

/**
 * Multer configured with in-memory storage: the file lands in
 * req.file.buffer instead of being written to disk, so we can stream it
 * straight into GridFS. Limited to 25MB, reasonable for PDFs/datasets
 * in a prototype.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// Expects the file to be sent under the form field name "file"
module.exports = upload.single("file");