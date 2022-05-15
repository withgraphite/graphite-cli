"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performInTmpDir = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
function performInTmpDir(handler) {
    const tmpDir = tmp_1.default.dirSync();
    const result = handler(tmpDir.name);
    fs_extra_1.default.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
    return result;
}
exports.performInTmpDir = performInTmpDir;
//# sourceMappingURL=perform_in_tmp_dir.js.map