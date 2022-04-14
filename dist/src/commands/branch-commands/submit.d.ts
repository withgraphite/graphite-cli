import type { argsT } from '../shared-commands/submit';
export { aliases, args, builder, command } from '../shared-commands/submit';
export declare const description = "Idempotently force push the current branch to GitHub, creating or updating a pull request.";
export declare const canonical = "branch submit";
export declare const handler: (argv: argsT) => Promise<void>;
