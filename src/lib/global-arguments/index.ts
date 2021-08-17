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
  globalArgs.quiet = argv.quiet;
  globalArgs.noVerify = !argv.verify;
  globalArgs.interactive = argv.interactive;
  execStateConfig.setOutputDebugLogs(argv.debug);
}

const globalArgs = { quiet: false, noVerify: false, interactive: true };

export { globalArgumentsOptions, processGlobalArgumentsMiddleware, globalArgs };
