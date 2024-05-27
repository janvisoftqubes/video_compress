// src/index.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { compressVideo, getFileSize } = require('./compress'); // Import the compressVideo and getFileSize functions

const app = express();
const upload = multer({ dest: 'uploads/' }); // Configure upload directory

// Function to convert bytes to megabytes
function bytesToMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2); // Convert to MB and round to 2 decimal places
}

app.post('/compress', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const inputFile = req.file.path;
    const outputDir = path.join(__dirname, 'compressed');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputFile = path.join(outputDir, `compressed-${req.file.filename}.mp4`);
    console.log("outputFile--->",outputFile)
    const options = {
      codec: 'libx264', // Example codec
      videoBitrate: '200k', // Higher video bitrate for better quality
      audioBitrate: '64k', // Higher audio bitrate for better quality
      size: '1280x720' // Use original resolution
    };

    const originalFileSize = await getFileSize(inputFile);
    const result = await compressVideo(inputFile, outputFile, options);

    if (!result || !result.outputFile) {
      throw new Error('Compression did not return output file path');
    }

    const compressedVideoData = fs.readFileSync(result.outputFile);

    // Convert file sizes to MB
    const originalFileSizeMB = bytesToMB(originalFileSize);
    const compressedFileSizeMB = bytesToMB(result.compressedFileSize);

    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Original-File-Size-MB': originalFileSizeMB,
      'Compressed-File-Size-MB': compressedFileSizeMB,
    });
    res.end(compressedVideoData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error compressing video' });
  }
});

app.listen(3000, () => console.log('Server listening on port 3000'));
