import { TContext } from '../../lib/context';
export declare function getPRBody(args: {
    branchName: string;
    editPRFieldsInline: boolean;
}, context: TContext): Promise<string>;
export declare function inferPRBody(branchName: string, context: TContext): string | undefined;
