import fs from 'fs';

export class StreamsService {
  static async readFile(absolutePath) {
    return await new Promise(resolve => {
      let response = '';
      const readStream = fs.createReadStream(absolutePath, { encoding: 'utf-8' });
      readStream.on('data', chunk => {
        response += chunk;
      });

      readStream.on('close', () => {
        resolve(response);
      });
    });
  }

  static getReadStream(source, options = {}) {
    return fs.createReadStream(source, options);
  }

  static getWriteStream(destination, options = {}) {
    return fs.createWriteStream(destination, options);
  }
}
