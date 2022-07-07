import { TContext } from './context';
import { TSplog } from './utils/splog';
export declare function captureState(context: TContext): string;
export declare function recreateState(stateJson: string, splog: TSplog): string;
