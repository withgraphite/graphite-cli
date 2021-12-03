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
const telemetry_1 = require("../../lib/telemetry");
const pr_templates_1 = require("../../lib/utils/pr_templates");
const args = {};
exports.command = "pr-templates";
exports.canonical = "repo pr-templates";
exports.description = "A list of your GitHub PR templates. These are used to pre-fill the bodies of your PRs created using the submit command.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        console.log(pr_templates_1.getPRTemplateFilepaths());
    }));
});
exports.handler = handler;
//# sourceMappingURL=pr_templates.js.map