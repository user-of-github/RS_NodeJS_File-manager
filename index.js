import FileManager from './fileManager.js';

const main = async () => {
  // TODO
  const username = process.argv[2];

  console.log(`Welcome to the File Manager, ${username}!`);

  process.addListener('exit', () => {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  });

  await FileManager.run();
};


await main();
