import { TContext } from '../../lib/context';
import { Branch } from '../../wrapper-classes/branch';
export declare function getPRTitle(args: {
    branch: Branch;
    editPRFieldsInline: boolean;
}, context: TContext): Promise<string>;
export declare function inferPRTitle(branch: Branch, context: TContext): string;
