"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let branchRefs = undefined;
let parentsRevList = undefined;
let childrenRevList = undefined;
let repoRootPath = undefined;
class Cache {
    getRepoRootPath() {
        return repoRootPath;
    }
    getBranchToRef() {
        return branchRefs === null || branchRefs === void 0 ? void 0 : branchRefs.branchToRef;
    }
    getRefToBranches() {
        return branchRefs === null || branchRefs === void 0 ? void 0 : branchRefs.refToBranches;
    }
    getParentsRevList() {
        return parentsRevList;
    }
    getChildrenRevList() {
        return childrenRevList;
    }
    clearAll() {
        branchRefs = undefined;
        parentsRevList = undefined;
        childrenRevList = undefined;
    }
    clearBranchRefs() {
        branchRefs = undefined;
    }
    setParentsRevList(newRevList) {
        parentsRevList = newRevList;
    }
    setChildrenRevList(newRevList) {
        childrenRevList = newRevList;
    }
    setBranchRefs(newBranchRefs) {
        branchRefs = newBranchRefs;
    }
    setRepoRootPath(newRepoRootPath) {
        repoRootPath = newRepoRootPath;
    }
}
const cache = new Cache();
exports.default = cache;
//# sourceMappingURL=cache.js.map