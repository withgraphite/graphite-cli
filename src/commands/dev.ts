import yargs from 'yargs';

export const command = 'dev <command>';
export const description = false;

export const builder = function (yargs: yargs.Argv): yargs.Argv {
  return yargs
    .commandDir('dev-commands', {
      extensions: ['js'],
    })
    .strict()
    .demandCommand();
};
