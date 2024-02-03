import path from 'path';

export class PathService {
  static isAbsolute(checkPath) {
    return path.isAbsolute(checkPath);
  }

  static toAbsolute(dirname, relative) {
    if (PathService.isAbsolute(relative)) {
      return relative;
    }

    return path.resolve(dirname, relative);
  }

  /**
   PathService::extractFilePathFromString() receives a string and expected number of paths inside it
   If path contains spaces, it must be wrapped with quotes, for example: cp "./path-to-file/file name with space.txt".
   But if we are expecting only one file in function, for example cat new file.txt -- then we can not use quotes.
   So quotes in required as wrapper for path/filename only if >= 2 entities are expected as arguments.
   So acceptable combinations for entering paths:  cp "folder 1" "folder 2", cp folder-no-space "folder 2", cp "folder space" folder-no-space, cp folder-no-space1 no-space2
   */
  static extractFilePathFromString(wholeStringFromInputSource, expectedPathsCount) {
    const invalidPathResponse = {parseStatusSuccess: false, paths: []};
    const longPathsDelimiter = '"';
    const basePathsDelimiter = ' ';

    const wholeStringFromInput = wholeStringFromInputSource.trim();
    const quotesCount = wholeStringFromInput.split('').filter(symbol => symbol === longPathsDelimiter).length;
    if (quotesCount % 2 !== 0) { // every filename must be wrapped from both sides ==> number of quotes is even
      return invalidPathResponse;
    }

    const splittedByQuotes = PathService.#splitPathsByDelimiter(wholeStringFromInput, longPathsDelimiter);

    if (expectedPathsCount === 1) {
      if (splittedByQuotes.length !== 1) {
        return invalidPathResponse;
      }

      return {parseStatusSuccess: true, paths: splittedByQuotes};
    }

    if (splittedByQuotes.length === 1) {
      // No long paths detected, for example: cp ./file1 ./file2  ==> split by space
      const paths = PathService.#splitPathsByDelimiter(wholeStringFromInput, basePathsDelimiter);
      if (paths.length !== expectedPathsCount) {
        return invalidPathResponse;
      }

      return { parseStatusSuccess: true, paths};
    }

    // one or all paths are in quotes, for example: cp "./file.txt" file2.txt
    if (splittedByQuotes.length !== expectedPathsCount) {
      return invalidPathResponse;
    }

    return {parseStatusSuccess: true, paths: splittedByQuotes}
  }

  static #splitPathsByDelimiter(input, delimiter) {
    return input.split(delimiter).filter(path => path.trim() !== '').map(item => item.trim());
  }
}
