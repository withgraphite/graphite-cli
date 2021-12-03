import type { argsT } from "../shared-commands/submit";
export { aliases, builder, command } from "../shared-commands/submit";
export declare const description = "Idempotently force push all downstack branches (including the current one) to GitHub, creating or updating distinct pull requests for each.";
export declare const canonical = "downstack submit";
export declare const handler: (argv: argsT) => Promise<void>;
