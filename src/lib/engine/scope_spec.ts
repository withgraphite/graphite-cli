export type TScopeSpec = {
  recursiveParents?: boolean;
  currentBranch?: boolean;
  recursiveChildren?: boolean;
};

export const SCOPE = {
  BRANCH: {
    recursiveParents: false as const,
    currentBranch: true as const,
    recursiveChildren: false as const,
  },

  DOWNSTACK: {
    recursiveParents: true as const,
    currentBranch: true as const,
    recursiveChildren: false as const,
  },

  STACK: {
    recursiveParents: true as const,
    currentBranch: true as const,
    recursiveChildren: true as const,
  },

  UPSTACK: {
    recursiveParents: false as const,
    currentBranch: true as const,
    recursiveChildren: true as const,
  },

  UPSTACK_EXCLUSIVE: {
    recursiveParents: false as const,
    currentBranch: false as const,
    recursiveChildren: true as const,
  },
};
