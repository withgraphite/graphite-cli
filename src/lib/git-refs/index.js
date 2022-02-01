"use strict";
exports.__esModule = true;
exports.otherBranchesWithSameCommit = exports.getRef = exports.getBranchChildrenOrParentsFromGit = void 0;
var branch_ref_1 = require("./branch_ref");
exports.getRef = branch_ref_1.getRef;
exports.otherBranchesWithSameCommit = branch_ref_1.otherBranchesWithSameCommit;
var branch_relations_1 = require("./branch_relations");
exports.getBranchChildrenOrParentsFromGit = branch_relations_1.getBranchChildrenOrParentsFromGit;
