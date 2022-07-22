import open from 'open';
import yargs from 'yargs';
import { graphiteWithoutRepo } from '../lib/runner';
const args = {} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

const DOCS_URL =
  'https://docs.graphite.dev/guides/graphite-cli/familiarizing-yourself-with-gt';
export const command = 'docs';
export const canonical = 'docs';
export const aliases = ['docs'];
export const description = 'Show the Graphite CLI docs.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphiteWithoutRepo(argv, canonical, async () => void open(DOCS_URL));
