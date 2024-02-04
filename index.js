import {FileManager} from './fileManager/FileManager.js';
import {getUsernameFromArgs} from './utils.js';

const main = async () => {
  const username = getUsernameFromArgs(process.argv);

  if (username === undefined) {
    console.warn('Username argument not provided');
  } else {
    console.info(`Welcome to the File Manager, ${username}!`);
  }

  process.addListener('exit', () => {
    console.info(`Thank you for using File Manager, ${username}, goodbye!`);
  });

  const fileManager = new FileManager();
  await fileManager.run();
};


await main();
