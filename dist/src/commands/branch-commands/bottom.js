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
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const branch_traversal_1 = require("../../actions/branch_traversal");
const exec_state_config_1 = require("../../lib/config/exec_state_config");
const profile_1 = require("../../lib/telemetry/profile");
const args = {};
exports.command = 'bottom';
exports.canonical = 'branch bottom';
exports.aliases = ['b'];
exports.description = "If you're in a stack: Branch A → Branch B → Branch C (you are here), checkout the branch at the bottom of the stack (Branch A).";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        yield branch_traversal_1.switchBranchAction(branch_traversal_1.TraversalDirection.Bottom, {
            interactive: exec_state_config_1.execStateConfig.interactive(),
        }, context);
    }));
});
exports.handler = handler;
//# sourceMappingURL=bottom.js.map