"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATION_HELPER_MESSAGE = void 0;
const chalk_1 = __importDefault(require("chalk"));
exports.VALIDATION_HELPER_MESSAGE = [
    "Graphite's stacks differ from your git branch relations",
    "Consider running:",
    `-> '${chalk_1.default.yellow("gt stack fix")}' (MOST COMMON SOLUTION) to rebase stacked branches onto their parent's HEAD commits`,
    `-> '${chalk_1.default.yellow("gt upstack onto <parent-branch>")}' to move a specific branch (and it's stacked children) onto another branch`,
    `-> '${chalk_1.default.yellow("gt branch parent --set <parent-branch>")}' to manually set the parent of a branch`,
].join("\n");
//# sourceMappingURL=validation_helper_message.js.map