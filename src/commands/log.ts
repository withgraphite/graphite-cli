import yargs from 'yargs';

export const command = 'log <command>';
export const desc = 'Commands that log your stacks.';
export const aliases = ['l'];
export const builder = function (yargs: yargs.Argv): yargs.Argv {
  return yargs
    .commandDir('log-commands', {
      extensions: ['js'],
    })
    .strict()
    .demandCommand();
};
