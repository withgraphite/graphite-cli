import { execSync, ExecSyncOptions } from "child_process";
import tracer from "../telemetry/tracer";

export function gpExecSync(
  command: {
    command: string;
    options?: ExecSyncOptions;
  },
  onError?: (e: Error) => void
): Buffer {
  try {
    // Only measure if we're with an exisiting span.
    if (tracer.currentSpanId) {
      return tracer.spanSync(
        {
          name: "execSync",
          resource: "gpExecSync",
          meta: { command: command.command },
        },
        () => {
          return execSync(command.command, {
            ...command.options,
          });
        }
      );
    } else {
      return execSync(command.command, {
        ...command.options,
      });
    }
  } catch (e) {
    onError?.(e);
    return Buffer.alloc(0);
  }
}
