import { execSync, ExecSyncOptions } from "child_process";

export function gpExecSync(
  command: {
    command: string;
    options?: ExecSyncOptions;
  },
  onError?: (e: Error) => void
): Buffer {
  try {
    return execSync(command.command, {
      ...command.options,
    });
  } catch (e) {
    onError?.(e);
    return Buffer.alloc(0);
  }
}
