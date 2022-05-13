import { argsT } from '../shared-commands/fix';
export { aliases, args, builder, command } from '../shared-commands/fix';
export declare const canonical = "upstack fix";
export declare const description = "Fix your changes upstack from the current branch, either by recursively rebasing branches onto their parents, or by regenerating Graphite's stack metadata from the branch relationships in the git commit tree.";
export declare const handler: (argv: argsT) => Promise<void>;
