import { execSync, ExecSyncOptions } from "child_process";

export function gpExecSync(
  command: {
    command: string;
    options?: ExecSyncOptions;
  },
  onError: (e: any) => Buffer | never
): Buffer {
  try {
    return execSync(command.command, {
      ...command.options,
    });
  } catch (e) {
    return onError(e);
  }
}
