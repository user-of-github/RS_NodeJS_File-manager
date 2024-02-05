import crypto from 'crypto';
import zlib from 'zlib';


export class CompressService {
  static compressExtension = '.br';

  static hash(data) {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  static async compressWithBrotli(sourceStream, destinationStream) {
    const brotli = zlib.createBrotliCompress();

    try {
      await new Promise(resolve => {
        const stream = sourceStream.pipe(brotli).pipe(destinationStream);
        stream.on('finish', resolve);
      });
    } catch (error) {
      throw error;
    }
  }

  static async decompressWithBrotli(sourceStream, destinationStream) {
    const brotli = zlib.createBrotliDecompress();

   try {
     await new Promise(resolve => {
       const stream = sourceStream.pipe(brotli).pipe(destinationStream);
       stream.on('finish', () => {
         resolve();
       });
     });
   } catch (error) {
     throw error;
   }
  }
}
