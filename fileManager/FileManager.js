import os from 'os';
import readline from 'readline';
import fs from 'fs';
import {StatsService} from './services/StatsService.js';
import {StreamsService} from './services/StreamsService.js';
import {PathService} from './services/PathService.js';
import {CompressService} from './services/CompressService.js';


class FileManager {
  static #invalidSinglePathMessage = 'Invalid path argument';
  static #invalid2PathsMessage = 'Invalid paths argument. 2 paths must be provided. If file-path contains spaces, it must be wrapped with "quoues"';

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
      const restPartOfInput = splittedInput.slice(1).join(' ');

      switch (command) {
        case 'up': {
          this.#up();
          break;
        }
        case 'cd': {
          const enteredPath = PathService.extractFilePathFromString(restPartOfInput, 1);
          if (!enteredPath.parseStatusSuccess) {
            console.warn(FileManager.#invalidSinglePathMessage);
            break;
          }

          await this.#cd(enteredPath.paths[0]);
          break;
        }
        case 'ls': {
          await this.#ls();
          break;
        }
        case 'cat': {
          const enteredPath = PathService.extractFilePathFromString(restPartOfInput, 1);
          if (!enteredPath.parseStatusSuccess) {
            console.warn(FileManager.#invalidSinglePathMessage);
            break;
          }

          await this.#cat(enteredPath.paths[0]);
          break;
        }
        case 'add': {
          const enteredFilename = PathService.extractFilePathFromString(restPartOfInput, 1);
          if (!enteredFilename.parseStatusSuccess) {
            console.warn(FileManager.#invalidSinglePathMessage);
            break;
          }
          await this.#add(enteredFilename.paths[0]);
          break;
        }
        case 'rn': {
          const enteredFilename = PathService.extractFilePathFromString(restPartOfInput, 2);
          if (!enteredFilename.parseStatusSuccess) {
            console.warn(FileManager.#invalid2PathsMessage);
            break;
          }
          await this.#rn(...enteredFilename.paths);
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
          const argument = splittedInput.at(1);
          this.#os(argument);
          break;
        }
        case 'hash': {
          const filePath = PathService.extractFilePathFromString(splittedInput.slice(1));
          await this.#hashFile(filePath);
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
        default: {
          console.warn('Unknown command');
          break;
        }
      }
    }
  }

  #up() {
    this.#currentDirectory = PathService.toAbsolute(this.#currentDirectory, '../');
  }

  async #cd(enteredPath) {
    const absolutePath = PathService.toAbsolute(this.#currentDirectory, enteredPath);
    const doesPathExist = await StatsService.doesPathExist(absolutePath);

    if (!doesPathExist) {
      console.warn('Path does not exist');
      return;
    }

    const isFolder = (await StatsService.stats(absolutePath)).isDirectory();

    if (!isFolder) {
      console.warn('Can\'t move into non-directory');
      return;
    }

    this.#currentDirectory = absolutePath;
  }

  async #ls() {
    const list = await new Promise(resolve => {
      fs.readdir(this.#currentDirectory, (error, files) => resolve(files));
    });

    const table = await Promise.all(list.map(async entity => {
      const fullPath = PathService.toAbsolute(this.#currentDirectory, entity);
      const stats = await StatsService.stats(fullPath);

      if (stats.isDirectory()) {
        return [entity, 'directory'];
      } else if (stats.isFile()) {
        return [entity, 'file'];
      } else {
        return [entity, 'other'];
      }
    }));

    console.table(table);
  }

  async #cat(filePath) {
    const absolutePath = PathService.toAbsolute(this.#currentDirectory, filePath);
    const data = StreamsService.readFile(absolutePath);
    console.log(data);
  }

  async #add(filename) {
    const absolutePath = PathService.toAbsolute(this.#currentDirectory, filename);

    const doesAlreadyExist = await StatsService.doesPathExist(absolutePath);
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

  async #rn(source, destination) {
    const [sourceAbsolute, destinationAbsolute] = [PathService.toAbsolute(this.#currentDirectory, source), PathService.toAbsolute(this.#currentDirectory, destination)];

    await new Promise(resolve => {
      fs.rename(sourceAbsolute, destinationAbsolute, error => {
        if (error) {
          console.log(error);
        }
        resolve();
      });
    });
  }

  #os(argument) {
    switch (argument) {
      case '--EOL': {
        console.log(os.EOL);
        break;
      }
      case '--cpus': {
        const table = os.cpus().map(cpu => [cpu.model, cpu.speed]);
        console.log(`CPUs count: ${table.length}`);
        console.table(table);
        break;
      }
      case '--homedir': {
        console.log(os.homedir());
        break;
      }
      case '--username': {
        console.log(os.userInfo().username);
        break;
      }
      case '--architecture': {
        console.log(os.arch())
      }
    }
  }

  async #hashFile(filePath) {
    const absolutePath = PathService.toAbsolute(this.#currentDirectory, filePath);
    const fileData = await StreamsService.readFile(absolutePath);
    const hashedValue = CompressService.hash(fileData);
    console.log(hashedValue);
  }
}

export default new FileManager();
