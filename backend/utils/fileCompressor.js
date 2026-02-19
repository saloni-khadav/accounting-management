const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

const compressImage = async (inputPath, outputPath, quality = 70) => {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    
    if (ext === '.png') {
      await sharp(inputPath)
        .png({ quality, compressionLevel: 9 })
        .toFile(outputPath);
    } else {
      await sharp(inputPath)
        .jpeg({ quality, mozjpeg: true })
        .toFile(outputPath);
    }
    
    return outputPath;
  } catch (error) {
    console.error('Image compression error:', error);
    throw error;
  }
};

const compressPDF = async (inputPath, outputPath) => {
  try {
    const existingPdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50
    });
    
    await fs.writeFile(outputPath, pdfBytes);
    return outputPath;
  } catch (error) {
    console.error('PDF compression error:', error);
    throw error;
  }
};

const compressFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const dir = path.dirname(filePath);
  const filename = path.basename(filePath, ext);
  const compressedPath = path.join(dir, `${filename}_compressed${ext}`);
  
  try {
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      await compressImage(filePath, compressedPath);
    } else if (ext === '.pdf') {
      await compressPDF(filePath, compressedPath);
    } else {
      return filePath;
    }
    
    await fs.unlink(filePath);
    await fs.rename(compressedPath, filePath);
    
    return filePath;
  } catch (error) {
    console.error('File compression error:', error);
    try {
      await fs.unlink(compressedPath);
    } catch (e) {}
    return filePath;
  }
};

module.exports = { compressFile, compressImage, compressPDF };
