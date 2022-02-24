export declare type TStackEditPickType = 'pick';
export declare type TStackEditType = TStackEditPickType;
export declare type TStackEditPick = {
    type: TStackEditPickType;
    branchName: string;
    onto: string;
};
export declare type TStackEdit = TStackEditPick;
export declare function isValidStackEditType(type: string): type is TStackEditType;
