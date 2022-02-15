import Branch from '../../wrapper-classes/branch';
export declare function getPRBody(args: {
    branch: Branch;
    editPRFieldsInline: boolean;
}): Promise<string>;
export declare function inferPRBody(branch: Branch): string | null;
