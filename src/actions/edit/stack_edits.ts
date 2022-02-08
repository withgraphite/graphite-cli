export type TStackEditPickType = 'pick';
export type TStackEditType = TStackEditPickType;
export type TStackEditPick = {
  type: TStackEditPickType;
  branchName: string;
  onto: string;
};
export type TStackEdit = TStackEditPick;

export function isValidStackEditType(type: string): type is TStackEditType {
  if (type === 'pick') {
    return true;
  }
  return false;
}
