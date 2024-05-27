// src/compress.js
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

function getFileSize(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.size);
      }
    });
  });
}

function compressVideo(inputFile, outputFile, options) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .videoCodec(options.codec || 'libx264')
      .videoBitrate(options.videoBitrate || '200k') // Higher video bitrate for better quality
      .audioBitrate(options.audioBitrate || '64k') // Higher audio bitrate for better quality
      .size(options.size) // Maintain original resolution
      .outputOptions('-crf 70') // Lower CRF for better quality
      .outputOptions('-preset superfast') // Faster preset for faster compression
      .on('end', async () => {
        try {
          const compressedFileSize = await getFileSize(outputFile);
          resolve({ outputFile, compressedFileSize });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => reject(err))
      .save(outputFile);
  });
}

module.exports = {
  compressVideo,
  getFileSize
};
