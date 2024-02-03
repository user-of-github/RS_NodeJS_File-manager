import {PathService} from '../services/PathService.js';

/**
 PathService::extractFilePathFromString() receives a string and expected number of paths inside it
 If path contains spaces, it must be wrapped with quotes, for example: cp "./path-to-file/file name with space.txt".
 But if we are expecting only one file in function, for example cat new file.txt -- then we can not use quotes.
 So quotes in required as wrapper for path/filename only if >= 2 entities are expected as arguments.
 So acceptable combinations for entering paths:  cp "folder 1" "folder 2", cp folder-no-space "folder 2", cp "folder space" folder-no-space, cp folder-no-space1 no-space2
 */
const testCases = [
  [['"path-in-quotes"  path-without-quotes', 2], {parseStatusSuccess: true, paths: ['path-in-quotes', 'path-without-quotes']}],
  [['"./long path with space/path-in-quotes.txt"  path-without-quotes', 2], {parseStatusSuccess: true, paths: ['./long path with space/path-in-quotes.txt', 'path-without-quotes']}],
  [['"./long path with space/path-in-quotes.txt"  path-without-quotes', 1], {parseStatusSuccess: false, paths: []}],
  [[' "./long path with space/path-in-quotes.txt"  ', 1], {parseStatusSuccess: true, paths: ['./long path with space/path-in-quotes.txt']}],
  [[' "./long path with space/path-in-quotes.txt"  ', 2], {parseStatusSuccess: false, paths: []}],
  [[' "./long path with space/path-in-quotes.txt"  ', 3], {parseStatusSuccess: false, paths: []}],
  [[' "./long path with space/path-in-quotes.txt"  "../../another-path.txt"', 2], {parseStatusSuccess: true, paths: ['./long path with space/path-in-quotes.txt', '../../another-path.txt']}],
  [[' "./long path with space/path-in-quotes.txt"  "../../another-path.txt"', 1], {parseStatusSuccess: false, paths: []}],
  [['./long path with space/path-in-quotes.txt', 1], {parseStatusSuccess: true, paths: ['./long path with space/path-in-quotes.txt']}],
  [['./long path with space/path-in-quotes.txt ./another-long-path/file with space.txt', 2], {parseStatusSuccess: false, paths: []}],
  [['./long path with space/path-in-quotes.txt ./another-long-path/file with space.txt', 1], {parseStatusSuccess: true, paths: ['./long path with space/path-in-quotes.txt ./another-long-path/file with space.txt']}],
  [['"folder 1" "./folder 2/file"', 2], {parseStatusSuccess: true, paths: ['folder 1', './folder 2/file']}],
];

const test = () => {
  testCases.forEach((testCase, index) => {
    console.log(`Test case #${index}`);

    const input = testCase[0];
    const expectedResult = testCase[1];
    const receivedResult = PathService.extractFilePathFromString(...input);

    console.assert(JSON.stringify(expectedResult) === JSON.stringify(receivedResult));
  });
};


test();
