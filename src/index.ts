#!/usr/bin/env node --no-warnings
// --no-warnings gets rid of warnings about "experimental fetch API" for our users
// we will still see any warnings when we run our tests because we don't execute directly

import chalk from 'chalk';
import semver from 'semver';
import tmp from 'tmp';
import yargs from 'yargs';
import { globalArgumentsOptions } from './lib/global_arguments';
import { getYargsInput } from './lib/pre-yargs/preprocess_command';
import { postTelemetryInBackground } from './lib/telemetry/post_traces';

const requiredVersion = '>=v14';
if (!semver.satisfies(process.version, requiredVersion)) {
  console.error(
    `Required node version ${requiredVersion} not satisfied with current version ${process.version}.`
  );
  // eslint-disable-next-line no-restricted-syntax
  process.exit(1);
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
    'Graphite is a command line tool that makes working with stacked changes fast & intuitive.'
  )
  .options(globalArgumentsOptions)
  .global(Object.keys(globalArgumentsOptions))
  .strict()
  .demandCommand().argv;
