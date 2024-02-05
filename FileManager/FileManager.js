import os from 'os';
import readline from 'readline';
import path from 'path';
import fs from 'fs';
import stream from 'stream';
import {StatsService} from './services/StatsService.js';
import {StreamsService} from './services/StreamsService.js';
import {PathService} from './services/PathService.js';
import {CompressService} from './services/CompressService.js';
import {Converter} from './services/Converter.js';


export class FileManager {
  static #invalidSinglePathMessage = 'Invalid path argument';
  static #unknownAttributeMessage = 'Unknown attribute';
  static #invalid2PathsMessage = 'Invalid paths argument. 2 paths must be provided. If file-path contains spaces, it should be wrapped with "quoues"';

  #currentDirectory;

  constructor() {
    this.#currentDirectory = os.homedir();
  }

  async run() {
    const consoleInputReader = readline.promises.createInterface({
      input: process.stdin, output: process.stdout
    });

    while (true) {
      console.info(`Current directory: ${this.#currentDirectory}`);

      const input = await consoleInputReader.question('');
      const splittedInput = input.split(' ');
      const command = splittedInput.at(0);
      const restPartOfInput = splittedInput.slice(1).join(' ');

      switch (command) {
        case 'up': {
          this.#up();
          break;
        }

        case 'cd': {
          const parsed = PathService.extractFilePathFromString(restPartOfInput, 1);
          if (!parsed.parseStatusSuccess) {
            console.warn(FileManager.#invalidSinglePathMessage);
            break;
          }

          await this.#cd(parsed.paths[0]);
          break;
        }

        case 'ls': {
          await this.#ls();
          break;
        }

        case 'cat': {
          const parsed = PathService.extractFilePathFromString(restPartOfInput, 1);
          if (!parsed.parseStatusSuccess) {
            console.warn(FileManager.#invalidSinglePathMessage);
            break;
          }

          await this.#cat(parsed.paths[0]);
          break;
        }

        case 'add': {
          const parsed = PathService.extractFilePathFromString(restPartOfInput, 1);
          if (!parsed.parseStatusSuccess) {
            console.warn(FileManager.#invalidSinglePathMessage);
            break;
          }
          await this.#add(parsed.paths[0]);
          break;
        }

        case 'rn': {
          const parsed = PathService.extractFilePathFromString(restPartOfInput, 2);
          if (!parsed.parseStatusSuccess) {
            console.warn(FileManager.#invalid2PathsMessage);
            break;
          }
          await this.#rn(...parsed.paths);
          break;
        }

        case 'cp': {
          const parsed = PathService.extractFilePathFromString(restPartOfInput, 2);
          if (!parsed.parseStatusSuccess) {
            console.warn(FileManager.#invalid2PathsMessage);
            break;
          }
          await this.#cp(...parsed.paths);
          break;
        }

        case 'mv': {
          const parsed = PathService.extractFilePathFromString(restPartOfInput, 2);
          if (!parsed.parseStatusSuccess) {
            console.warn(FileManager.#invalid2PathsMessage);
            break;
          }
          await this.#mv(...parsed.paths);
          break;
        }

        case 'rm': {
          const parsed = PathService.extractFilePathFromString(restPartOfInput, 1);
          if (!parsed.parseStatusSuccess) {
            console.warn(FileManager.#invalidSinglePathMessage);
            break;
          }

          await this.#rm(parsed.paths[0]);
          break;
        }

        case 'os': {
          const argument = splittedInput.at(1);
          this.#os(argument);
          break;
        }

        case 'hash': {
          const parsed = PathService.extractFilePathFromString(restPartOfInput, 1);
          if (!parsed.parseStatusSuccess) {
            console.warn(FileManager.#invalidSinglePathMessage);
            break;
          }

          await this.#hashFile(parsed.paths.at(0));
          break;
        }

        case 'compress': {
          const parsed = PathService.extractFilePathFromString(restPartOfInput, 2);
          if (!parsed.parseStatusSuccess) {
            console.warn(FileManager.#invalid2PathsMessage);
            break;
          }

          await this.#compress(...parsed.paths);
          break;
        }

        case 'decompress': {
          const enteredFilename = PathService.extractFilePathFromString(restPartOfInput, 2);
          if (!enteredFilename.parseStatusSuccess) {
            console.warn(FileManager.#invalid2PathsMessage);
            break;
          }
          await this.#decompress(...enteredFilename.paths);
          break;
        }

        case '.exit': {
          consoleInputReader.close();
          return;
        }

        case '': {
          console.warn('Empty command');
          break;
        }

        default: {
          console.warn(`Unknown command "${command}"`);
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

      try {
        if (stats.isDirectory()) {
          return [entity, 'directory'];
        } else if (stats.isFile()) {
          return [entity, 'file'];
        } else if (stats.isSymbolicLink()) {
          return [entity, 'symbolic link'];
        } else {
          return [entity, 'other'];
        }
      } catch (error) {
        return [entity, 'unknown'];
      }
    }));

    console.table(table);
  }

  async #cat(filePath) {
    const absolutePath = PathService.toAbsolute(this.#currentDirectory, filePath);
    try {
      const data = await StreamsService.readFile(absolutePath);
      console.info(data);
    } catch {
      console.warn('Unable to read contents by passed path');
    }
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
          console.info(err.message);
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
          console.log(error.message);
        }
        resolve();
      });
    });
  }

  async #cp(source, destination) {
    const absoluteSource = PathService.toAbsolute(this.#currentDirectory, source);
    const copiedFileName = PathService.getFullFilename(absoluteSource);
    const absoluteDestination = path.resolve(PathService.toAbsolute(this.#currentDirectory, destination), copiedFileName);

    const isSourceAFile = (await StatsService.stats(absoluteSource))?.isFile();

    if (!isSourceAFile) {
      console.warn('cp command works only with file types and existing source-paths');
      return false;
    }

    try {
      const sourceStream = StreamsService.getReadStream(absoluteSource);
      const destinationStream = StreamsService.getWriteStream(absoluteDestination, {flags: 'wx+'});

      await stream.promises.pipeline(sourceStream, destinationStream);
    } catch {
      console.warn('Unable to copy. Some error occurred. Maybe some path is invalid or target file already exists in destination folder');
      return false;
    }

    return true;
  }

  async #rm(path) {
    const absolutePath = PathService.toAbsolute(this.#currentDirectory, path);

    await new Promise(resolve => {
      fs.rm(absolutePath, error => {
        if (error) {
          console.warn(error.message);
        }

        resolve();
      });
    });
  }

  async #mv(source, destination) {
    const isCopySuccessful = await this.#cp(source, destination);

    if (isCopySuccessful) {
      await this.#rm(source);
    } else {
      console.warn('Failed to execute mv command');
    }
  }

  #os(argument) {
    switch (argument) {
      case '--EOL': {
        console.info(os.EOL);
        break;
      }
      case '--cpus': {
        const table = os.cpus().map(cpu => {
          return [cpu.model, `${Converter.MHzToGHz(cpu.speed)} GHz`];
        });
        console.info(`CPUs count: ${table.length}`);
        console.table(table);
        break;
      }
      case '--homedir': {
        console.info(os.homedir());
        break;
      }
      case '--username': {
        console.info(os.userInfo().username);
        break;
      }
      case '--architecture': {
        console.info(os.arch());
        break;
      }
      case undefined: {
        console.info('os command requires an attribute');
        break;
      }
      default: {
        console.info(FileManager.#unknownAttributeMessage);
        break;
      }
    }
  }

  async #hashFile(filePath) {
    const absolutePath = PathService.toAbsolute(this.#currentDirectory, filePath);

    try {
      const fileData = await StreamsService.readFile(absolutePath);
      const hashedValue = CompressService.hash(fileData);
      console.info(hashedValue);
    } catch {
      console.warn('Provided path is not a file or not valid or unable to hash such contents');
    }
  }

  async #compress(source, destination) {
    const absoluteSource = PathService.toAbsolute(this.#currentDirectory, source);
    const absoluteDestinationFolder = PathService.toAbsolute(this.#currentDirectory, destination);

    const destinationFolderExists = await new Promise(resolve => fs.exists(absoluteDestinationFolder, resolve));

    if (!destinationFolderExists) {
      console.warn('Destination folder does not exist: ' + absoluteDestinationFolder);
      return;
    }

    const absoluteDestination = path.resolve(
      absoluteDestinationFolder,
      PathService.getFullFilename(source) + CompressService.compressExtension
    );

    const destinationExists = await new Promise(resolve => fs.exists(absoluteDestination, resolve));

    if (destinationExists) {
      console.warn('Destination file already exists: ' + absoluteDestination);
      return;
    }

    try {
      await fs.promises.access(absoluteSource);

      const sourceStream = StreamsService.getReadStream(absoluteSource);
      const destinationStream = StreamsService.getWriteStream(absoluteDestination, {flags: 'wx+'});

      await CompressService.compressWithBrotli(sourceStream, destinationStream);
    } catch (error) {
      console.warn('Unable to compress. Paths may be incorrect, or destination folder already contains compressed file with same name');
      console.warn(error.message);
    }
  }

  async #decompress(source, destination) {
    const absoluteSource = PathService.toAbsolute(this.#currentDirectory, source);
    const absoluteDestinationFolder = PathService.toAbsolute(this.#currentDirectory, destination);

    const destinationFolderExists = await new Promise(resolve => fs.exists(absoluteDestinationFolder, resolve));

    if (!destinationFolderExists) {
      console.warn('Destination folder does not exist: ' + absoluteDestinationFolder);
      return;
    }

    let absoluteDestination = path.resolve(
      absoluteDestinationFolder,
      PathService.getFullFilename(source)
    );

    if (absoluteDestination.endsWith(CompressService.compressExtension)) {
      absoluteDestination = absoluteDestination.slice(0, -1 * CompressService.compressExtension.length);
    } else {
      console.warn(`Can not decompress files without ${CompressService.compressExtension} extension`);
      return;
    }

    const destinationExists = await new Promise(resolve => fs.exists(absoluteDestination, resolve));

    if (destinationExists) {
      console.warn('Destination file already exists: ' + absoluteDestination);
      return;
    }

    try {
      await fs.promises.access(absoluteSource);

      const sourceStream = StreamsService.getReadStream(absoluteSource);
      const destinationStream = StreamsService.getWriteStream(absoluteDestination, {flags: 'wx+'});

      await CompressService.decompressWithBrotli(sourceStream, destinationStream);
    } catch (error) {
      console.warn('Unable to decompress. Paths may be incorrect, or destination folder already contains compressed file with same name');
      console.warn(error.message);
    }
  }
}
