import crypto from 'crypto';
import zlib from 'zlib';


export class CompressService {
  static hash(data) {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  static async compressWithBrotli(sourceStream, destinationStream) {
    const brotli = zlib.createBrotliCompress();

    await new Promise(resolve => {
      const stream = sourceStream.pipe(brotli).pipe(destinationStream);
      stream.on('finish', () => {
        resolve();
      });
    });
  }

  static async decompressWithBrotli(sourceStream, destinationStream) {
    const brotli = zlib.createBrotliDecompress();

    await new Promise(resolve => {
      const stream = sourceStream.pipe(brotli).pipe(destinationStream);
      stream.on('finish', () => {
        resolve();
      });
    });
  }
}
