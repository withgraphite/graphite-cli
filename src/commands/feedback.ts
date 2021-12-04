import yargs from 'yargs';
import { logInfo } from '../lib/utils';

export const command = 'feedback <command>';
export const desc = 'Commands for providing feedback and debug state.';
export const builder = function (yargs: yargs.Argv): yargs.Argv {
  return yargs
    .commandDir('feedback-commands', {
      extensions: ['js'],
    })
    .strict()
    .showHelpOnFail(false)
    .fail(function (msg) {
      logInfo(`${msg} Use 'gt feedback --help' for usage instructions`);
    })
    .demandCommand();
};
