// Handles GridFS upload/download streams, used by version + review controllers

const mongoose = require("mongoose");
const { Readable } = require("stream");
const { getBucket } = require("../config/gridfs");

/**
 * Uploads a buffer (from multer's in-memory storage) into GridFS.
 * Returns a promise resolving to the new file's ObjectId.
 */
exports.uploadBuffer = (buffer, filename, contentType) => {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(filename, { contentType });

    Readable.from(buffer)
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => resolve(uploadStream.id));
  });
};

/**
 * Returns a readable stream for a file stored in GridFS, given its id.
 * Caller is responsible for piping this to the HTTP response.
 */
exports.downloadStream = (fileId) => {
  const bucket = getBucket();
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
};

/** Removes a stored file and its chunks. A file that is already gone is not an error. */
exports.deleteFile = async (fileId) => {
  try {
    await getBucket().delete(new mongoose.Types.ObjectId(fileId));
  } catch (err) {
    console.warn("GridFS delete skipped:", err.message);
  }
};