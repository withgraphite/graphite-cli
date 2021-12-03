#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchBranchAction = exports.TraversalDirection = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
var TraversalDirection;
(function (TraversalDirection) {
    TraversalDirection["Top"] = "TOP";
    TraversalDirection["Bottom"] = "BOTTOM";
    TraversalDirection["Next"] = "NEXT";
    TraversalDirection["Previous"] = "PREV";
})(TraversalDirection = exports.TraversalDirection || (exports.TraversalDirection = {}));
function getStackBranch(candidates) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield prompts_1.default({
            type: "select",
            name: "branch",
            message: "Multiple branches found at the same level. Select a branch to guide the navigation",
            choices: candidates.map((b) => {
                return { title: b.name, value: b.name, branch: b };
            }),
        }, {
            onCancel: () => {
                throw new errors_1.KilledError();
            },
        })).branch;
    });
}
function getDownstackBranch(currentBranch, direction, numSteps) {
    let branch = currentBranch;
    let prevBranch = branch.getParentFromMeta();
    let indent = 0;
    // Bottom goes to the bottom of the stack but prev can go up to trunk
    if (direction === TraversalDirection.Previous && (prevBranch === null || prevBranch === void 0 ? void 0 : prevBranch.isTrunk())) {
        branch = prevBranch;
        indent++;
    }
    while (prevBranch && !prevBranch.isTrunk()) {
        utils_1.logInfo(`${"  ".repeat(indent)}↳(${branch})`);
        branch = prevBranch;
        prevBranch = branch.getParentFromMeta();
        indent++;
        if (direction === TraversalDirection.Previous && indent === numSteps) {
            break;
        }
    }
    utils_1.logInfo(`${"  ".repeat(indent)}↳(${chalk_1.default.cyan(branch)})`);
    return branch === null || branch === void 0 ? void 0 : branch.name;
}
function getUpstackBranch(currentBranch, interactive, direction, numSteps) {
    return __awaiter(this, void 0, void 0, function* () {
        let branch = currentBranch;
        let candidates = branch.getChildrenFromMeta();
        let indent = 0;
        while (branch && candidates.length) {
            if (candidates.length === 1) {
                utils_1.logInfo(`${"  ".repeat(indent)}↳(${branch})`);
                branch = candidates[0];
            }
            else {
                if (interactive) {
                    const stack_base_branch = yield getStackBranch(candidates);
                    branch = yield branch_1.default.branchWithName(stack_base_branch);
                }
                else {
                    throw new errors_1.ExitFailedError(`Cannot get next branch, multiple choices available: [${candidates.join(", ")}]`);
                }
            }
            indent++;
            if (direction === TraversalDirection.Next && indent === numSteps) {
                break;
            }
            candidates = branch.getChildrenFromMeta();
        }
        utils_1.logInfo(`${"  ".repeat(indent)}↳(${chalk_1.default.cyan(branch)})`);
        return branch === null || branch === void 0 ? void 0 : branch.name;
    });
}
function switchBranchAction(direction, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = preconditions_1.currentBranchPrecondition();
        let nextBranch;
        switch (direction) {
            case TraversalDirection.Bottom: {
                nextBranch = getDownstackBranch(currentBranch, TraversalDirection.Bottom);
                break;
            }
            case TraversalDirection.Previous: {
                nextBranch = getDownstackBranch(currentBranch, TraversalDirection.Previous, opts.numSteps);
                break;
            }
            case TraversalDirection.Top: {
                nextBranch = yield getUpstackBranch(currentBranch, opts.interactive, TraversalDirection.Top);
                break;
            }
            case TraversalDirection.Next: {
                nextBranch = yield getUpstackBranch(currentBranch, opts.interactive, TraversalDirection.Next, opts.numSteps);
                break;
            }
        }
        if (nextBranch && nextBranch != currentBranch.name) {
            child_process_1.execSync(`git checkout "${nextBranch}"`, { stdio: "ignore" });
            utils_1.logInfo(`Switched to ${nextBranch}`);
        }
        else {
            utils_1.logInfo(`Already at the ${direction === TraversalDirection.Previous || TraversalDirection.Bottom ? 'bottom most' : 'top most'} branch in the stack. Exiting.`);
        }
    });
}
exports.switchBranchAction = switchBranchAction;
//# sourceMappingURL=branch_traversal.js.map