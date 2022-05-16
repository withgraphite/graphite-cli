import { TContext } from '../context';
export declare function logMessageFromGraphite(msg: string): void;
export declare function logError(msg: string): void;
export declare function logWarn(msg: string): void;
export declare function logInfo(msg: string): void;
export declare function logSuccess(msg: string): void;
export declare function logDebug(msg: string): void;
export declare function logTip(msg: string, context: TContext): void;
export declare function logNewline(): void;
