import os from 'os';
import readline from 'readline';
import path from 'path';
import fs from 'fs';


class FileManager {
  #currentDirectory;

  constructor() {
    this.#currentDirectory = os.homedir();
    console.info(`Initial directory: ${this.#currentDirectory}`);
  }

  async run() {
    const read = readline.promises.createInterface({
      input: process.stdin,
      output: process.stdout
    });


    while (true) {
      const input = await read.question('');
      const splittedInput = input.split(' ');
      const command = splittedInput.at(0);

      switch (command) {
        case 'up': {
          this.#up();
          break;
        }
        case 'cd': {
          const enteredPath = splittedInput.at(1);
          await this.#cd(enteredPath);
          break;
        }
        case 'ls': {
          await this.#ls();
          break;
        }
        case 'cat': {
          break;
        }
        case 'rn': {
          break;
        }
        case 'cp': {
          break;
        }
        case 'mv': {
          break;
        }
        case 'rm': {
          break;
        }
        case 'os': {
          break;
        }
        case 'compress': {
          break;
        }
        case 'decompress': {
          break;
        }
        case '.exit': {
          read.close();
          return;
        }
      }
    }
  }

  #up() {
    this.#currentDirectory = path.resolve(this.#currentDirectory, '../');
  }

  async #cd(enteredPath) {
    let absolutePath;

    if (path.isAbsolute(enteredPath)) {
      absolutePath = enteredPath;
    } else {
      absolutePath = path.resolve(this.#currentDirectory, enteredPath);
    }

    const doesPathExist = FileManager.#doesPathExist(absolutePath);
    const isFolder = FileManager.#isDirectory(absolutePath);

    if (!isFolder) {
      console.error('Can\'t move into non-directory');
      return;
    }

    if (doesPathExist) {
      this.#currentDirectory = absolutePath;
    } else {
      console.error('Path does not exist')
    }
  }

  async #ls() {
    const list = new Promise(resolve => {
      fs.readdir(this.#currentDirectory, resolve);
    });

    const directories = await Promise.all(list.map(entity => {
      return new Promise(resolve => {
        FileManager.#isDirectory(entity).then(resolve);
      });
    }));
  }

  static async #isDirectory(absolutePath) {
    const stats = await new Promise(resolve => {
      fs.lstat(absolutePath, (error, stats) => resolve(error))
    });

    return stats.isDirectory();
  }

  static async #doesPathExist(absolutePath) {
    return await new Promise(resolve => {
      fs.exists(absolutePath, resolve);
    });
  }
}

export default new FileManager();
