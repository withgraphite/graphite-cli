import { argsT } from '../shared-commands/submit';
export { aliases, args, builder, command } from '../shared-commands/submit';
export declare const description = "Idempotently force push the upstack branches to GitHub, creating or updating pull requests as necessary.";
export declare const canonical = "upstack submit";
export declare const handler: (argv: argsT) => Promise<void>;
