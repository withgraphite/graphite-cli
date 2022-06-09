import yargs from 'yargs';

export const globalArgumentsOptions = {
  interactive: {
    default: true,
    type: 'boolean',
    demandOption: false,
    description: 'Prompt the user. Disable with --no-interactive.',
  },
  quiet: {
    alias: 'q',
    default: false,
    type: 'boolean',
    demandOption: false,
    description: 'Minimize output to the terminal.',
  },
  verify: {
    default: true,
    type: 'boolean',
    demandOption: false,
    description: 'Run git hooks. Disable with --no-verify.',
  },
  debug: {
    default: false,
    type: 'boolean',
    demandOption: false,
    description: 'Display debug output.',
  },
} as const;

export type TGlobalArguments = Partial<
  yargs.InferredOptionTypes<typeof globalArgumentsOptions>
>;
