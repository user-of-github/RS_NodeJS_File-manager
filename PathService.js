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

  static extractFilePathFromString(fromInput) {
    return fromInput.join(' ');
  }
}
