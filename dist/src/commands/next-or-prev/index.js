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
exports.PrevCommand = exports.NextCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const abstract_command_1 = __importDefault(require("../abstract_command"));
const args = {};
class NextCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            yield nextOrPrev("next");
        });
    }
}
exports.NextCommand = NextCommand;
NextCommand.args = args;
class PrevCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            yield nextOrPrev("prev");
        });
    }
}
exports.PrevCommand = PrevCommand;
PrevCommand.args = args;
function nextOrPrev(nextOrPrev) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = branch_1.default.getCurrentBranch();
        const candidates = nextOrPrev === "next"
            ? yield currentBranch.getChildrenFromGit()
            : yield currentBranch.getParentsFromGit();
        if (candidates.length === 0) {
            console.log(chalk_1.default.yellow(`Found no ${nextOrPrev} branch`));
            process.exit(1);
        }
        if (candidates.length > 1) {
            console.log(chalk_1.default.yellow(`Found multiple possibilities:`));
            for (const candidate of candidates) {
                console.log(chalk_1.default.yellow(` - ${candidate.name}`));
            }
            process.exit(1);
        }
        const branchName = candidates.values().next().value.name;
        child_process_1.execSync(`git checkout "${branchName}"`, { stdio: "ignore" });
    });
}
//# sourceMappingURL=index.js.map