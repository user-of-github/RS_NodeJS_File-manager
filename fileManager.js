import os from 'os';
import { createInterface } from 'readline/promises';

class FileManager {
  #currentDirectory;

  constructor() {
    this.#currentDirectory = os.homedir();
  }

  async run() {
    const read = createInterface({
      input: process.stdin,
      output: process.stdout
    });


    while (true) {
      const input = await read.question('');
      const splittedInput = input.split(' ');
      const command = splittedInput.at(0);

      switch (command) {
        case 'up': {
          break;
        }
        case 'cd': {
          break;
        }
        case 'ls': {
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
      }
    }
  }
}

export default new FileManager();
