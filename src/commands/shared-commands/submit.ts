import yargs from 'yargs';

export const command = 'submit';

/**
 * Primary interaction patterns:
 *
 * # (default) allows user to edit PR fields inline and then submits stack as a draft
 * gt stack submit
 *
 * # skips editing PR fields inline, submits stack as a draft
 * gt stack submit --no-edit
 *
 * # allows user to edit PR fields inline, then opens as draft
 * gt stack submit --draft
 *
 * # allows user to edit PR fields inline, then publishes
 * gt stack submit --publish
 *
 * # same as gt stack submit --no-edit
 * gt stack submit --no-interactive
 *
 */
export const args = {
  draft: {
    describe:
      'If set, marks PR as draft. If --no-interactive is true, new PRs will be created in draft mode.',
    type: 'boolean',
    default: false,
    alias: 'd',
  },
  publish: {
    describe:
      'If set, publishes PR. If --no-interactive is true, new PRs will be created in draft mode.',
    type: 'boolean',
    default: false,
    alias: 'p',
  },
  edit: {
    describe:
      'Edit PR fields inline. If --no-interactive is true, this is automatically set to false.',
    type: 'boolean',
    default: true,
    alias: 'e',
  },
  'no-edit': {
    type: 'boolean',
    describe: "Don't edit PR fields inline. Takes precedence over --edit",
    demandOption: false,
    default: false,
    alias: 'n',
  },
  reviewers: {
    describe: 'Prompt to manually set reviewers if true',
    type: 'boolean',
    default: false,
    alias: 'r',
  },
  'dry-run': {
    describe:
      'Reports the PRs that would be submitted and terminates. No branches are pushed and no PRs are opened or updated.',
    type: 'boolean',
    default: false,
  },
  confirm: {
    describe:
      'Reports the PRs that would be submitted and asks for confirmation before pushing branches and opening/updating PRs. If either of --no-interactive or --dry-run is passed, this flag is ignored.',
    type: 'boolean',
    default: false,
    alias: 'c',
  },
  'update-only': {
    describe: 'Only update the PRs that have been already been submitted.',
    type: 'boolean',
    default: false,
    alias: 'u',
  },
  force: {
    describe:
      'Force push: overwrites the remote branch with your local branch. Otherwise defaults to --force-with-lease.',
    type: 'boolean',
    default: false,
    alias: 'f',
  },
} as const;

export const builder = args;
export const aliases = ['s'];
export type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
