import * as t from '@withgraphite/retype';

export type TStackEditPickType = 'pick';
export const StackedEditPickSchema = t.shape({
  type: t.literal('pick' as const),
  branchName: t.string,
  onto: t.string,
});
export type TStackEditPick = t.TypeOf<typeof StackedEditPickSchema>;
export type TStackEdit = t.TypeOf<typeof StackedEditPickSchema>;
export type TStackEditType = TStackEdit['type'];

export function isValidStackEditType(type: string): type is TStackEditType {
  if (type === 'pick') {
    return true;
  }
  return false;
}
