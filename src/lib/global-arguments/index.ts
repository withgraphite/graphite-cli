import yargs from "yargs";

const globalArgumentsOptions = {
  quiet: { alias: "q", default: false, type: "boolean", demandOption: false },
  verify: { default: true, type: "boolean", demandOption: false },
} as const;

type argsT = yargs.Arguments<
  yargs.InferredOptionTypes<typeof globalArgumentsOptions>
>;

function processGlobalArgumentsMiddleware(argv: argsT): void {
  globalArgs.quiet = argv.quiet;
  globalArgs.verify = argv.verify;
}

const globalArgs = { quiet: false, verify: false };

export { globalArgumentsOptions, processGlobalArgumentsMiddleware, globalArgs };
