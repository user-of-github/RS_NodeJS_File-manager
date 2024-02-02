import os from 'os';
import readline from 'readline';
import path from 'path';
import fs from 'fs';


class FileManager {
  #currentDirectory;

  constructor() {
    this.#currentDirectory = os.homedir();
    console.info(`Current directory: ${this.#currentDirectory}`);
  }

  async run() {
    const read = readline.promises.createInterface({
      input: process.stdin,
      output: process.stdout
    });


    while (true) {
      console.info(`Current directory: ${this.#currentDirectory}`);
      const input = await read.question('');
      const splittedInput = input.split(' ');
      const command = splittedInput.at(0);

      switch (command) {
        case 'up': {
          this.#up();
          break;
        }
        case 'cd': {
          const enteredPath = splittedInput.slice(1).join(' ');
          await this.#cd(enteredPath);
          break;
        }
        case 'ls': {
          await this.#ls();
          break;
        }
        case 'cat': {
          const enteredPath = splittedInput.slice(1).join(' ');
          await this.#cat(enteredPath);
          break;
        }
        case 'add': {
          const enteredFilename = splittedInput.slice(1).join(' ');
          await this.#add(enteredFilename);
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

    const doesPathExist = await FileManager.#doesPathExist(absolutePath);
    const isFolder = await FileManager.#isDirectory(absolutePath);

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
    const list = await new Promise(resolve => {
      fs.readdir(this.#currentDirectory, (error, files) => resolve(files));
    });

    const directoriesFlags = await Promise.all(list.map(entity => {
      const fullPath = path.resolve(this.#currentDirectory, entity);
      return new Promise(resolve => {
        FileManager.#isDirectory(fullPath).then(resolve);
      });
    }));

    const files = [];
    const directories = [];

    for (let index = 0; index < list.length; ++index) {
      if (directoriesFlags[index]) {
        directories.push(list[index]);
      } else {
        files.push(list[index]);
      }
    }

    const table = [];
    directories.forEach(directory => table.push([directory, 'directory']));
    files.forEach(file => table.push([file, 'file']));

    console.table(table);
  }

  async #cat(filePath) {
    const absolutePath = path.resolve(this.#currentDirectory, filePath);

    const data = await new Promise(resolve => {
      let response = '';
      const readStream = fs.createReadStream(absolutePath, { encoding: 'utf-8' });
      readStream.on('data', chunk => {
        response += chunk;
      });

      readStream.on('close', () => {
        resolve(response);
      });
    });

    console.log(data);
  }

  async #add(filename) {
    const absolutePath = path.resolve(this.#currentDirectory, filename);

    const doesAlreadyExist = await new Promise(resolve => fs.exists(absolutePath, resolve));
    if (doesAlreadyExist) {
      console.warn('File with such name already exists. Aborting');
      return;
    }

    await new Promise(resolve => {
      fs.open(absolutePath, 'w', (err, descriptor) => {
        if (err) {
          console.log(err.message);
          resolve();
        }

        fs.close(descriptor, () => {
          resolve();
        });
      });
    });
  }

  static async #isDirectory(absolutePath) {
    const stats = await new Promise(resolve => {
      fs.lstat(absolutePath, (error, stats) => resolve(stats))
    });

    return stats?.isDirectory?.();
  }

  static async #doesPathExist(absolutePath) {
    return await new Promise(resolve => {
      fs.exists(absolutePath, resolve);
    });
  }
}

export default new FileManager();
