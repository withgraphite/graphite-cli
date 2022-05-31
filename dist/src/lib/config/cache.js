"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
let branchRefs = undefined;
let parentsRevList = undefined;
let childrenRevList = undefined;
let metaChildren = undefined;
let branchList = undefined;
class Cache {
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
    getMetaChildren() {
        return metaChildren;
    }
    getBranchList() {
        return branchList;
    }
    clearAll() {
        branchRefs = undefined;
        parentsRevList = undefined;
        childrenRevList = undefined;
        metaChildren = undefined;
        branchList = undefined;
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
    setMetaChildren(newMetaChildren) {
        metaChildren = newMetaChildren;
    }
    setBranchList(newBranchList) {
        branchList = newBranchList;
    }
}
exports.cache = new Cache();
//# sourceMappingURL=cache.js.map