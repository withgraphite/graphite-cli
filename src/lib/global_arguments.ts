import yargs from 'yargs';

export const globalArgumentsOptions = {
  interactive: {
    alias: 'i',
    default: true,
    type: 'boolean',
    demandOption: false,
  },
  quiet: { alias: 'q', default: false, type: 'boolean', demandOption: false },
  verify: { default: true, type: 'boolean', demandOption: false },
  debug: { default: false, type: 'boolean', demandOption: false },
} as const;

export type TGlobalArguments = yargs.Arguments<
  yargs.InferredOptionTypes<typeof globalArgumentsOptions>
>;
