export const testCasesForPathExtracting = [
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
  [['file with long name/file.txt "./another folder 2/file"', 2], {parseStatusSuccess: true, paths: ['file with long name/file.txt', './another folder 2/file']}], // strange case, but actually it does not break anything :)
];

export const testCasesForFullFileName = [
  ['../folder 1/filename.txt', 'filename.txt'],
  ['filename.txt', 'filename.txt'],
  ['./filename.bat.txt', 'filename.bat.txt'],
];
