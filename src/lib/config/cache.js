"use strict";
exports.__esModule = true;
var branchRefs = undefined;
var parentsRevList = undefined;
var childrenRevList = undefined;
var repoRootPath = undefined;
var Cache = /** @class */ (function () {
    function Cache() {
    }
    Cache.prototype.getRepoRootPath = function () {
        return repoRootPath;
    };
    Cache.prototype.getBranchToRef = function () {
        return branchRefs === null || branchRefs === void 0 ? void 0 : branchRefs.branchToRef;
    };
    Cache.prototype.getRefToBranches = function () {
        return branchRefs === null || branchRefs === void 0 ? void 0 : branchRefs.refToBranches;
    };
    Cache.prototype.getParentsRevList = function () {
        return parentsRevList;
    };
    Cache.prototype.getChildrenRevList = function () {
        return childrenRevList;
    };
    Cache.prototype.clearAll = function () {
        branchRefs = undefined;
        parentsRevList = undefined;
        childrenRevList = undefined;
    };
    Cache.prototype.clearBranchRefs = function () {
        branchRefs = undefined;
    };
    Cache.prototype.setParentsRevList = function (newRevList) {
        parentsRevList = newRevList;
    };
    Cache.prototype.setChildrenRevList = function (newRevList) {
        childrenRevList = newRevList;
    };
    Cache.prototype.setBranchRefs = function (newBranchRefs) {
        branchRefs = newBranchRefs;
    };
    Cache.prototype.setRepoRootPath = function (newRepoRootPath) {
        repoRootPath = newRepoRootPath;
    };
    return Cache;
}());
var cache = new Cache();
exports["default"] = cache;
