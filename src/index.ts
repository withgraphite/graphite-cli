#!/usr/bin/env node
/* eslint-disable no-console */

import chalk from 'chalk';
import tmp from 'tmp';
import yargs from 'yargs';
import { postTelemetryInBackground } from './background_tasks/post_traces';
import { globalArgumentsOptions } from './lib/global_arguments';
import { getYargsInput } from './lib/pre-yargs/preprocess_command';

// this line gets rid of warnings about "experimental fetch API" for our users
// while still showing us warnings when we test with DEBUG=1
if (!process.env.DEBUG) {
  process.removeAllListeners('warning');
}

// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp.setGracefulCleanup();

process.on('uncaughtException', (err) => {
  postTelemetryInBackground();
  console.log(chalk.redBright(`UNCAUGHT EXCEPTION: ${err.message}`));
  console.log(chalk.redBright(`UNCAUGHT EXCEPTION: ${err.stack}`));
  // eslint-disable-next-line no-restricted-syntax
  process.exit(1);
});

void yargs(getYargsInput())
  .commandDir('commands')
  .help()
  .usage(
    'Graphite is a command line tool that makes working with stacked changes fast & intuitive.\n\nhttps://docs.graphite.dev/guides/graphite-cli'
  )
  .options(globalArgumentsOptions)
  .global(Object.keys(globalArgumentsOptions))
  .strict()
  .demandCommand().argv;
