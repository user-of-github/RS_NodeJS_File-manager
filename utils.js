/**
 Looks for --username={name} pattern in args
*/
export const getUsernameFromArgs = processArgv => {
  const usernameArgKey = '--username';

  for (let index = 2; index < processArgv.length; ++index) {
    const splitted = processArgv.at(index).split('=');

    if (splitted.at(0) === usernameArgKey) {
      return splitted.at(1);
    }
  }

  return undefined;
};
