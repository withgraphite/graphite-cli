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
exports.handler = exports.builder = exports.aliases = exports.description = exports.canonical = exports.command = void 0;
const interactive_branch_selection_1 = require("../../actions/interactive_branch_selection");
const checkout_branch_1 = require("../../lib/git/checkout_branch");
const profile_1 = require("../../lib/telemetry/profile");
const args = {
    branch: {
        describe: `Optional branch to checkout`,
        demandOption: false,
        type: 'string',
        positional: true,
    },
};
exports.command = 'checkout [branch]';
exports.canonical = 'branch checkout';
exports.description = 'Checkout a branch in a stack';
exports.aliases = ['co'];
exports.builder = args;
const handler = (args) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(args, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const branch = (_a = args.branch) !== null && _a !== void 0 ? _a : (yield interactive_branch_selection_1.interactiveBranchSelection(context, {
            message: 'Checkout a branch',
        }));
        checkout_branch_1.checkoutBranch(branch);
    }));
});
exports.handler = handler;
//# sourceMappingURL=checkout.js.map