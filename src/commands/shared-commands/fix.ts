import yargs from 'yargs';

export const command = 'fix';
export const args = {
  rebase: {
    describe: `Fix your stack by recursively rebasing branches onto their parents, as recorded in Graphite's stack metadata.`,
    demandOption: false,
    default: false,
    type: 'boolean',
  },
  regen: {
    describe: `Regenerate Graphite's stack metadata from the branch relationships in the git commit tree, overwriting the previous Graphite stack metadata.`,
    demandOption: false,
    default: false,
    type: 'boolean',
  },
} as const;

export const builder = args;
export const aliases = ['f'];
export type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
