import { TContext } from '../context';
export declare function getBranchReplacement(context: TContext): string;
export declare function newBranchName(branchName: string | undefined, commitMessage: string | undefined, context: TContext): string | undefined;
export declare function setBranchPrefix(newPrefix: string, context: TContext): string;
export declare function getBranchDateEnabled(context: TContext): boolean;
