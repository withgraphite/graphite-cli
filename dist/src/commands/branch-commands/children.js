"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const preconditions_1 = require("../../lib/preconditions");
const profile_1 = require("../../lib/telemetry/profile");
const args = {};
exports.command = 'children';
exports.canonical = 'branch children';
exports.description = 'Show the child branches of your current branch (i.e. directly above the current branch in the stack) as tracked by Graphite. Branch location metadata is stored under `.git/refs/branch-metadata`.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        const branch = preconditions_1.currentBranchPrecondition(context);
        const children = branch.getChildrenFromMeta(context);
        if (children.length === 0) {
            context.splog.logInfo(`(${branch}) has no child branches (branches stacked on top of it).`);
        }
        else {
            children.forEach((child) => console.log(child.name));
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=children.js.map