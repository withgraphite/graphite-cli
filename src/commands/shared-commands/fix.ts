import yargs from 'yargs';

export const command = 'fix';
export const args = {} as const;

export const builder = args;
export const aliases = ['f'];
export type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
