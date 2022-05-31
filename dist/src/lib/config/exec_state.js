"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeExecState = void 0;
function composeExecState(globalArguments) {
    var _a, _b, _c, _d;
    return {
        outputDebugLogs: (_a = globalArguments === null || globalArguments === void 0 ? void 0 : globalArguments.debug) !== null && _a !== void 0 ? _a : false,
        quiet: (_b = globalArguments === null || globalArguments === void 0 ? void 0 : globalArguments.quiet) !== null && _b !== void 0 ? _b : false,
        noVerify: (_c = !(globalArguments === null || globalArguments === void 0 ? void 0 : globalArguments.verify)) !== null && _c !== void 0 ? _c : false,
        interactive: (_d = globalArguments === null || globalArguments === void 0 ? void 0 : globalArguments.interactive) !== null && _d !== void 0 ? _d : true,
    };
}
exports.composeExecState = composeExecState;
//# sourceMappingURL=exec_state.js.map