import { TContext } from './context';
export declare function getRepoRootPathPrecondition(): string;
export declare function uncommittedTrackedChangesPrecondition(): void;
export declare function ensureSomeStagedChangesPrecondition(context: TContext): void;
export declare function cliAuthPrecondition(context: TContext): string;
export declare function currentGitRepoPrecondition(): string;
