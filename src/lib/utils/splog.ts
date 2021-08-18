import chalk from "chalk";
import { execStateConfig } from "../config";
import { globalArgs } from "../global-arguments";

export function logError(msg: string): void {
  console.log(chalk.redBright(`ERROR: ${msg}`));
}

export function logWarn(msg: string): void {
  console.log(chalk.yellow(`WARNING: ${msg}`));
}

export function logInfo(msg: string): void {
  if (!globalArgs.quiet) {
    console.log(`${msg}`);
  }
}

export function logSuccess(msg: string): void {
  if (!globalArgs.quiet) {
    console.log(chalk.green(`${msg}`));
  }
}

export function logDebug(msg: string): void {
  if (execStateConfig.outputDebugLogs()) {
    console.log(msg);
  }
}

export function logNewline(): void {
  if (!globalArgs.quiet) {
    console.log("");
  }
}
