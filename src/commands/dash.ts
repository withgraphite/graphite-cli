import yargs from 'yargs';

export const command = 'dash <command>';
export const aliases = ['d'];
export const desc = 'Open the web dashboard.';
export const builder = function (yargs: yargs.Argv): yargs.Argv {
  return yargs
    .commandDir('dash-commands', {
      extensions: ['js'],
    })
    .strict();
};
