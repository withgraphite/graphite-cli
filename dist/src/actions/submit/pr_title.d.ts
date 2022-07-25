import { TContext } from '../../lib/context';
export declare function getPRTitle(args: {
    branchName: string;
    editPRFieldsInline?: boolean;
}, context: TContext): Promise<string>;
