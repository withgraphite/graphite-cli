import { argsT } from '../shared-commands/fix';
export { aliases, args, builder, command } from '../shared-commands/fix';
export declare const canonical = "stack fix";
export declare const description = "Fix your stack of changes, either by recursively rebasing branches onto their parents, or by regenerating Graphite's stack metadata from the branch relationships in the git commit tree.";
export declare const handler: (argv: argsT) => Promise<void>;
