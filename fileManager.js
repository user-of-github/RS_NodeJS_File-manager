import os from 'os';
import readline from 'readline';
import path from 'path';
import fs from 'fs';
import {StatsService} from './StatsService.js';
import {StreamsService} from './StreamsService.js';
import {PathService} from './PathService.js';
import {CompressService} from './CompressService.js';


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
          //const input = splittedInput.slice(1).join(' ');
          //await this.#rn(input);
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
      }
    }
  }

  #up() {
    this.#currentDirectory = PathService.toAbsolute(this.#currentDirectory, '../');
  }

  async #cd(enteredPath) {
    const absolutePath = PathService.toAbsolute(this.#currentDirectory, enteredPath);
    const doesPathExist = await StatsService.doesPathExist(absolutePath);
    const isFolder = (await StatsService.stats(absolutePath)).isDirectory();

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

  async #rn(enteredInputSource) {
    // TODO: what to do with filenames with space ?
    const parsed = enteredInputSource.trim().split(' ');
    const filenameInQuotesRegex = /"([^"])"/g;
    const [source, destination] = [parsed[0], parsed[1]];
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
