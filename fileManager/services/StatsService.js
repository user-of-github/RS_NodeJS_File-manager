import fs from 'fs';

export class StatsService {
  static async stats(absolutePath) {
    return await new Promise(resolve => {
      fs.lstat(absolutePath, (error, stats) => {
        resolve(stats);
      });
    });
  }

  static async doesPathExist(absolutePath) {
    return await new Promise(resolve => {
      fs.exists(absolutePath, resolve);
    });
  }
}
