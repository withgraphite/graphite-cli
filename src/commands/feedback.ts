import yargs from 'yargs';

export const command = 'feedback <command>';
export const desc = 'Commands for providing feedback and debug state.';
export const builder = function (yargs: yargs.Argv): yargs.Argv {
  return yargs
    .commandDir('feedback-commands', {
      extensions: ['js'],
    })
    .strict()
    .showHelpOnFail(false)
    .demandCommand();
};
