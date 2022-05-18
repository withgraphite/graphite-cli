import * as t from '@withgraphite/retype';
export declare const StackedEditSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    type: "pick";
    branchName: string;
} | {
    type: "exec";
    command: string;
};
export declare type TStackEdit = t.TypeOf<typeof StackedEditSchema>;
export declare type TStackEditType = TStackEdit['type'];
export declare function getStackEditType(type: string): TStackEditType | undefined;
