import { TContext } from '../context';
import { logInfo } from '../utils/splog';

export function validate(context: TContext): void {
  void context;
  logInfo('validating');
}
