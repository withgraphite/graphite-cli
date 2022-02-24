import { TContext } from '../../lib/context/context';
import Branch from '../../wrapper-classes/branch';
export declare function getPRBody(args: {
    branch: Branch;
    editPRFieldsInline: boolean;
}, context: TContext): Promise<string>;
export declare function inferPRBody(branch: Branch, context: TContext): string | null;
