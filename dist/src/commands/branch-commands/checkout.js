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
const interactive_checkout_1 = require("../../actions/interactive_checkout");
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
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
    return telemetry_1.profile(args, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        if (args.branch) {
            utils_1.gpExecSync({ command: `git checkout ${args.branch}` });
        }
        else {
            yield interactive_checkout_1.interactiveCheckout();
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=checkout.js.map