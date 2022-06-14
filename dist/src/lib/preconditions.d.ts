import { TContext } from './context';
export declare function getRepoRootPathPrecondition(): string;
declare function uncommittedTrackedChangesPrecondition(): void;
declare function ensureSomeStagedChangesPrecondition(context: TContext): void;
declare function cliAuthPrecondition(context: TContext): string;
declare function currentGitRepoPrecondition(): string;
export { uncommittedTrackedChangesPrecondition, currentGitRepoPrecondition, ensureSomeStagedChangesPrecondition, cliAuthPrecondition, };
