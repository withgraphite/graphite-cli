import Branch from "../../wrapper-classes/branch";
export declare function getPRTitle(args: {
    branch: Branch;
    editPRFieldsInline: boolean;
}): Promise<string>;
export declare function inferPRTitle(branch: Branch): string;
