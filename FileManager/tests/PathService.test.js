import {PathService} from '../services/PathService.js';
import {testCasesForFullFileName, testCasesForPathExtracting} from './test.data.js';

const testExtractingPathsFromString = () => {
  testCasesForPathExtracting.forEach((testCase, index) => {
    console.log(`[Paths extracting] Test case #${index}`);

    const input = testCase[0];
    const expectedResult = testCase[1];
    const receivedResult = PathService.extractFilePathFromString(...input);

    console.assert(JSON.stringify(expectedResult) === JSON.stringify(receivedResult));
  });
};


const testGettingFullFilename = () => {
  testCasesForFullFileName.forEach((testCase, index) => {
    console.log(`[Getting full filename] Test case #${index}`);

    const input = testCase[0];
    const expectedResult = testCase[1];
    const receivedResult = PathService.getFullFilename(input);

    console.assert(receivedResult === expectedResult);
  });
};

const runTests = () => {
  testExtractingPathsFromString();
  testGettingFullFilename();
};

runTests();
