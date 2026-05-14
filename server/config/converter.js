// server/config/converter.js
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

const convertToMp4 = (inputPath) => {
  return new Promise((resolve, reject) => {
    // El archivo de salida tiene el mismo nombre pero extensión .mp4
    const outputPath = inputPath.replace(path.extname(inputPath), '.mp4');

    console.log(`🎬 Convirtiendo video: ${path.basename(inputPath)} → mp4`);

    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',    // codec de video
        '-c:a aac',        // codec de audio
        '-movflags faststart', // permite reproducir antes de terminar la descarga
        '-preset fast',    // velocidad de conversión
        '-crf 23'          // calidad (0=mejor, 51=peor, 23=balance)
      ])
      .output(outputPath)
      .on('end', () => {
        // Borra el archivo original .mov
        fs.unlinkSync(inputPath);
        console.log(`✅ Conversión completada: ${path.basename(outputPath)}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('❌ Error en conversión:', err.message);
        reject(err);
      })
      .run();
  });
};

export default convertToMp4;