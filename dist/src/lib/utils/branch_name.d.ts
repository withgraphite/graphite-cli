import { TContext, TContextLite } from '../context';
export declare function replaceUnsupportedCharacters(input: string, context: TContextLite): string;
export declare function getBranchReplacement(context: TContextLite): string;
export declare function newBranchName(branchName: string | undefined, commitMessage: string | undefined, context: TContext): string | undefined;
export declare function setBranchPrefix(newPrefix: string, context: TContextLite): string;
export declare function getBranchDateEnabled(context: TContextLite): boolean;
