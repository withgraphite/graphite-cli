import chalk from "chalk";
import fetch from "node-fetch";
import yargs from "yargs";
import { version } from "../../package.json";
import { profile, userEmail } from "../lib/telemetry";

async function checkForUpgrade(): Promise<void> {
  try {
    const user = userEmail();
    const response = await fetch(
      `https://api.graphite.dev/v1/graphite/upgrade?${[
        ...(user ? [`user=${user}`] : []),
        `currentVersion=${version}`,
      ].join("&")}`,
      { method: "GET" }
    );
    if (response.status == 200) {
      const prompt = JSON.parse(response.body.toString()).prompt as
        | { message: string; blocking: boolean }
        | undefined;
      if (prompt) {
        if (!prompt.blocking) {
          console.log(chalk.yellow(prompt.message));
        } else {
          console.log(chalk.red(prompt.message));
          process.exit(1);
        }
      }
    }
  } catch (err) {
    console.log(`Failed to check for upgrade, ${err}`);
  }
}
export default abstract class AbstractCommand<
  T extends { [key: string]: yargs.Options }
> {
  abstract _execute(
    argv: Omit<yargs.Arguments<yargs.InferredOptionTypes<T>>, "$0" | "_">
  ): Promise<void>;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async execute(argv: yargs.Arguments<yargs.InferredOptionTypes<T>>) {
    await checkForUpgrade();
    await profile(this.constructor.name, async () => {
      await this._execute(argv);
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async executeUnprofiled(
    argv: Omit<yargs.Arguments<yargs.InferredOptionTypes<T>>, "$0" | "_">
  ) {
    await this._execute(argv);
  }
}
