export declare function userEmail(): string | undefined;
export declare function logCommand(command: string, message?: string): Promise<void>;
export declare function profile<T>(command: string, handler: () => Promise<void>): Promise<void>;
export declare function logError(err: Error): Promise<void>;
