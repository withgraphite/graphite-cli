import yargs from "yargs";
import { checkForUpgrade, profile } from "../lib/telemetry";

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
