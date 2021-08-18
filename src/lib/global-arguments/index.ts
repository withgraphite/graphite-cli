import yargs from "yargs";
import { execStateConfig } from "../config";

const globalArgumentsOptions = {
  interactive: {
    alias: "i",
    default: true,
    type: "boolean",
    demandOption: false,
  },
  quiet: { alias: "q", default: false, type: "boolean", demandOption: false },
  verify: { default: true, type: "boolean", demandOption: false },
  debug: { default: false, type: "boolean", demandOption: false },
} as const;

type argsT = yargs.Arguments<
  yargs.InferredOptionTypes<typeof globalArgumentsOptions>
>;

function processGlobalArgumentsMiddleware(argv: argsT): void {
  execStateConfig
    .setQuiet(argv.quiet)
    .setNoVerify(!argv.verify)
    .setInteractive(argv.interactive)
    .setOutputDebugLogs(argv.debug);
}

export { globalArgumentsOptions, processGlobalArgumentsMiddleware };
