import * as t from '@withgraphite/retype';
export declare type TStackEditPickType = 'pick';
export declare const StackedEditPickSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    type: "pick";
    branchName: string;
    onto: string;
};
export declare type TStackEditPick = t.TypeOf<typeof StackedEditPickSchema>;
export declare type TStackEdit = t.TypeOf<typeof StackedEditPickSchema>;
export declare type TStackEditType = TStackEdit['type'];
export declare function isValidStackEditType(type: string): type is TStackEditType;
