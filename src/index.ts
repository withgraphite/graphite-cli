#!/usr/bin/env node
import chalk from 'chalk';
import tmp from 'tmp';
import yargs from 'yargs';
import {
  globalArgumentsOptions,
  processGlobalArgumentsMiddleware,
} from './lib/globalArguments';
import { passthrough } from './lib/passthrough';
import { postTelemetryInBackground } from './lib/telemetry/post_traces';
import { preprocessCommand } from './lib/utils/preprocess_command';
import { signpostDeprecatedCommands } from './lib/utils/signpost_deprecated_commands';
import { logError } from './lib/utils/splog';

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
  logError(err.message);
  // eslint-disable-next-line no-restricted-syntax
  process.exit(1);
});

function deprecatedGpWarning(argv: yargs.Arguments) {
  if (argv['$0'].endsWith('gp')) {
    console.log(
      chalk.red(
        `Warning: Based on feedback, we've updated the Graphite CLI alias to "gt". The alias "gp" has been deprecated.`
      )
    );
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
  }
}

passthrough(process.argv);
preprocessCommand();
signpostDeprecatedCommands(process.argv.slice(2));
yargs(process.argv.slice(2))
  .commandDir('commands')
  .help()
  .middleware(deprecatedGpWarning)
  .usage(
    [
      'Graphite is a command line tool that makes working with stacked changes fast & intuitive.',
    ].join('\n')
  )
  .options(globalArgumentsOptions)
  .middleware(processGlobalArgumentsMiddleware)
  .strict()
  .demandCommand().argv;
