import { execSync, ExecSyncOptions, SpawnSyncReturns } from 'child_process';
import { globalTracer as tracer } from '../telemetry/tracer';

export type GPExecSyncOptions = {
  // Both 1) capture the output from stdout and return it (like normal execSync)
  // and 2) print the output to the stdout specified in ExecSyncOptions's
  // 'stdio'.
  printStdout?: boolean;
};

export function gpExecSync(
  command: {
    command: string;
    options?: ExecSyncOptions & GPExecSyncOptions;
  },
  onError?: (e: Error & SpawnSyncReturns<Buffer>) => void
): Buffer {
  try {
    // Only measure if we're with an existing span.
    if (tracer.currentSpanId) {
      return tracer.spanSync(
        {
          name: 'execSync',
          resource: 'gpExecSync',
          meta: { command: command.command },
        },
        () => {
          return gpExecSyncImpl(command);
        }
      );
    } else {
      return gpExecSyncImpl(command);
    }
  } catch (e) {
    onError?.(e);
    return Buffer.alloc(0);
  }
}

function gpExecSyncImpl(command: {
  command: string;
  options?: ExecSyncOptions & GPExecSyncOptions;
}): Buffer {
  const output = execSync(command.command, {
    ...command.options,
  });
  if (command.options?.printStdout) {
    console.log(output.toString());
  }
  return output;
}
