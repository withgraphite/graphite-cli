import yargs from 'yargs';
export function parseArgs(args: yargs.Arguments): {
  alias: string;
  command: string;
  args: string;
} {
  return {
    command: args['_'].join(' '),
    alias: args['$0'],
    args: Object.keys(args)
      .filter((k) => k != '_' && k != '$0')
      .map((k) => `--${k} "${args[k]}"`)
      .join(' '),
  };
}
