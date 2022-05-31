import { TGlobalArguments } from '../global_arguments';

type TExecState = {
  outputDebugLogs: boolean;
  quiet: boolean;
  noVerify: boolean;
  interactive: boolean;
};

export function composeExecState(
  globalArguments?: TGlobalArguments
): TExecState {
  return {
    outputDebugLogs: globalArguments?.debug ?? false,
    quiet: globalArguments?.quiet ?? false,
    noVerify: !globalArguments?.verify ?? false,
    interactive: globalArguments?.interactive ?? true,
  };
}
