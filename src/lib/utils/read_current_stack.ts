import Branch from '../../wrapper-classes/branch';
import { TScope } from '../../actions/scope';
import { MetaStackBuilder, Stack } from '../../wrapper-classes';

export function read_current_stack(args: {
  currentBranch: Branch;
  scope: TScope;
}): Stack {
  switch (args.scope) {
    case 'UPSTACK':
      return new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
        args.currentBranch
      );
    case 'DOWNSTACK':
      return new MetaStackBuilder().downstackFromBranch(args.currentBranch);
    case 'FULLSTACK':
      return new MetaStackBuilder().fullStackFromBranch(args.currentBranch);
  }
}
