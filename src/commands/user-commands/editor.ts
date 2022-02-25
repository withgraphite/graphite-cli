import yargs from 'yargs';
import { profile } from '../../lib/telemetry';
import { logInfo } from '../../lib/utils';
import { setDefaultEditor } from '../../lib/utils/default_editor';

const args = {
  set: {
    demandOption: false,
    default: '',
    type: 'string',
    describe: 'Set default editor for Graphite. eg --set vim',
  },
  unset: {
    demandOption: false,
    default: false,
    type: 'boolean',
    describe: 'Unset default editor for Graphite. eg --unset',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const DEFAULT_GRAPHITE_EDITOR = 'nano';
export const command = 'editor';
export const description = 'Editor used when using Graphite';
export const canonical = 'user editor';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (argv.set) {
      context.userConfig.update((data) => (data.editor = argv.set));
      logInfo(`Editor preference set to: ${argv.set}`);
    } else if (argv.unset) {
      context.userConfig.update(
        (data) => (data.editor = DEFAULT_GRAPHITE_EDITOR)
      );
      logInfo(
        `Editor preference erased. Defaulting to Graphite default: ${DEFAULT_GRAPHITE_EDITOR}`
      );
    } else {
      if (!context.userConfig.data.editor) {
        setDefaultEditor(context);
      }
      logInfo(
        `Current editor preference is set to : ${context.userConfig.data.editor}`
      );
    }
  });
};
