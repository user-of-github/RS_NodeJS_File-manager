import fs from 'fs';

export class StreamsService {
  static async readFile(absolutePath) {
    return await new Promise((resolve, reject) => {
      let response = '';
      const readStream = fs.createReadStream(absolutePath, {encoding: 'utf-8'});
      readStream.on('data', chunk => {
        response += chunk;
      });

      readStream.on('error', reject);

      readStream.on('close', () => {
        resolve(response);
      });
    });
  }

  static getReadStream(source, options = {}) {
    try {
      return fs.createReadStream(source, options).on('error', error => {
        throw error;
      });
    } catch (error) {
      throw error;
    }
  }

  static getWriteStream(destination, options = {}) {
    try {
      return fs.createWriteStream(destination, options).on('error', error => {
        throw error;
      });
    } catch (error) {
      throw error;
    }
  }
}
