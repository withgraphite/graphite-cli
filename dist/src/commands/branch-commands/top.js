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
exports.handler = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const branch_traversal_1 = require("../../actions/branch_traversal");
const config_1 = require("../../lib/config");
const telemetry_1 = require("../../lib/telemetry");
const args = {};
exports.command = "top";
exports.canonical = "branch top";
exports.aliases = ["t"];
exports.description = "If you're in a stack: Branch A → Branch B (you are here) → Branch C → Branch D , checkout the branch at the top of the stack (Branch D). If there are multiple parent branches in the stack, `gt branch top` will prompt you to choose which branch to checkout.";
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        yield branch_traversal_1.switchBranchAction(branch_traversal_1.TraversalDirection.Top, {
            interactive: config_1.execStateConfig.interactive(),
        });
    }));
});
exports.handler = handler;
//# sourceMappingURL=top.js.map