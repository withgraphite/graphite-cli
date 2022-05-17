import { execSync, ExecSyncOptions, SpawnSyncReturns } from 'child_process';
import { assertIsError } from '../errors';
import { tracer } from '../telemetry/tracer';

export type GPExecSyncOptions = {
  // Output is always returned (like normal execSync).  This option lets us
  // print it.  A lambda allows us to mutate the displayed output.
  printStdout?: boolean | ((out: string) => string);
};

export function gpExecSync(
  command: {
    command: string;
    options?: ExecSyncOptions & GPExecSyncOptions;
  },
  onError?: (e: Error & SpawnSyncReturns<string>) => void
): string {
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
    assertIsError(e);
    onError?.(e as Error & SpawnSyncReturns<string>);
    return '';
  }
}

function gpExecSyncImpl(command: {
  command: string;
  options?: ExecSyncOptions & GPExecSyncOptions;
}): string {
  const output = execSync(command.command, {
    ...command.options,
    encoding: 'utf8',
  });
  if (command.options?.printStdout === true) {
    console.log(output.toString());
  } else if (command.options?.printStdout) {
    console.log(command.options?.printStdout(output.toString()));
  }
  return output;
}
