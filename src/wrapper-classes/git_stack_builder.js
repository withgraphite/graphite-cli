"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var _1 = require(".");
var errors_1 = require("../lib/errors");
var GitStackBuilder = /** @class */ (function (_super) {
    __extends(GitStackBuilder, _super);
    function GitStackBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GitStackBuilder.prototype.getBranchParent = function (branch) {
        return branch.getParentsFromGit()[0];
    };
    GitStackBuilder.prototype.getChildrenForBranch = function (branch) {
        this.checkSiblingBranches(branch);
        return branch.getChildrenFromGit();
    };
    GitStackBuilder.prototype.getParentForBranch = function (branch) {
        this.checkSiblingBranches(branch);
        var parents = branch.getParentsFromGit();
        if (parents.length > 1) {
            throw new errors_1.MultiParentError(branch, parents);
        }
        return parents[0];
    };
    GitStackBuilder.prototype.checkSiblingBranches = function (branch) {
        var siblingBranches = branch.branchesWithSameCommit();
        if (siblingBranches.length > 0) {
            throw new errors_1.SiblingBranchError([branch].concat(siblingBranches));
        }
    };
    return GitStackBuilder;
}(_1.AbstractStackBuilder));
exports["default"] = GitStackBuilder;
