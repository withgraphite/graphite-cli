import { MetadataRef } from '../../wrapper-classes/metadata_ref';
import { TContext } from '../context';
import { logInfo } from '../utils/splog';

type TAllBranchRelations = Map<
  string,
  { parentName?: string; parentRevision?: string }
>;

export function validate(context: TContext): void {
  const allBranchRelations: TAllBranchRelations = new Map(
    MetadataRef.allMetadataRefs().map((ref) => {
      const meta = ref.read();
      return [
        ref._branchName,
        {
          parentName: meta?.parentBranchName,
          parentRevision: meta?.parentBranchRevision,
        },
      ];
    })
  );
  void context;
  allBranchRelations.forEach((value, key) => {
    logInfo(`${key}: ${JSON.stringify(value)}`);
  });
}
