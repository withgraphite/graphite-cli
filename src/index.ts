#!/usr/bin/env node
import chalk from 'chalk';
import tmp from 'tmp';
import yargs from 'yargs';
import { globalArgumentsOptions } from './lib/global_arguments';
import { passthrough } from './lib/passthrough';
import { postTelemetryInBackground } from './lib/telemetry/post_traces';
import { preprocessCommand } from './lib/utils/preprocess_command';

// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp.setGracefulCleanup();

process.on('uncaughtException', (err) => {
  postTelemetryInBackground({
    canonicalCommandName: 'unknown',
    commandName: 'unknown',
    durationMiliSeconds: 0,
    err: {
      errName: err.name,
      errMessage: err.message,
      errStack: err.stack || '',
    },
  });
  console.log(chalk.red(`UNCAUGHT EXCEPTION: ${err.message}`));
  // eslint-disable-next-line no-restricted-syntax
  process.exit(1);
});

passthrough(process.argv);
preprocessCommand();
void yargs(process.argv.slice(2))
  .commandDir('commands')
  .help()
  .usage(
    'Graphite is a command line tool that makes working with stacked changes fast & intuitive.'
  )
  .options(globalArgumentsOptions)
  .global(Object.keys(globalArgumentsOptions))
  .strict()
  .demandCommand().argv;
