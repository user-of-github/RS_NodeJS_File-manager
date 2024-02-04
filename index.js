import FileManager from './fileManager/FileManager.js';

const main = async () => {
  const username = process.argv[2].split('=').at(1);

  console.info(`Welcome to the File Manager, ${username}!`);

  process.addListener('exit', () => {
    console.info(`Thank you for using File Manager, ${username}, goodbye!`);
  });

  await FileManager.run();
};


await main();
