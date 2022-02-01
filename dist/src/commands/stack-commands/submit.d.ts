import type { argsT } from '../shared-commands/submit';
export { aliases, args, builder, command } from '../shared-commands/submit';
export declare const canonical = "stack submit";
export declare const description = "Idempotently force push all branches in the current stack to GitHub, creating or updating distinct pull requests for each.";
export declare const handler: (argv: argsT) => Promise<void>;
