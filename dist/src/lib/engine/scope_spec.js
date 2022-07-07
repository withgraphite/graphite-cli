"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCOPE = void 0;
exports.SCOPE = {
    BRANCH: {
        recursiveParents: false,
        currentBranch: true,
        recursiveChildren: false,
    },
    DOWNSTACK: {
        recursiveParents: true,
        currentBranch: true,
        recursiveChildren: false,
    },
    STACK: {
        recursiveParents: true,
        currentBranch: true,
        recursiveChildren: true,
    },
    UPSTACK: {
        recursiveParents: false,
        currentBranch: true,
        recursiveChildren: true,
    },
    UPSTACK_EXCLUSIVE: {
        recursiveParents: false,
        currentBranch: false,
        recursiveChildren: true,
    },
};
//# sourceMappingURL=scope_spec.js.map