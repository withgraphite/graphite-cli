"use strict";
// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
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
exports.logError = exports.profile = exports.logCommand = exports.userEmail = void 0;
const child_process_1 = require("child_process");
function shouldReportTelemetry() {
    return process.env.NODE_ENV != "development";
}
function userEmail() {
    try {
        return child_process_1.execSync("git config user.email").toString().trim();
    }
    catch (err) {
        return undefined;
    }
}
exports.userEmail = userEmail;
function logCommand(command, message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (shouldReportTelemetry()) {
            // TODO
        }
    });
}
exports.logCommand = logCommand;
function profile(command, handler) {
    return __awaiter(this, void 0, void 0, function* () {
        void logCommand(command);
        try {
            yield handler();
        }
        catch (err) {
            void logError(err);
            throw err;
        }
    });
}
exports.profile = profile;
function logError(err) {
    return __awaiter(this, void 0, void 0, function* () {
        if (shouldReportTelemetry()) {
            // TODO
        }
    });
}
exports.logError = logError;
//# sourceMappingURL=index.js.map