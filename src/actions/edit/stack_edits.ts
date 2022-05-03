import * as t from '@withgraphite/retype';

export const StackedEditSchema = t.union(
  t.shape({
    type: t.literal('pick' as const),
    branchName: t.string,
  }),
  t.shape({
    type: t.literal('exec' as const),
    command: t.string,
  })
);
export type TStackEdit = t.TypeOf<typeof StackedEditSchema>;
export type TStackEditType = TStackEdit['type'];

export function getStackEditType(type: string): TStackEditType | undefined {
  if (['pick', 'p'].includes(type)) {
    return 'pick';
  }
  if (['exec', 'x'].includes(type)) {
    return 'exec';
  }
  return undefined;
}
