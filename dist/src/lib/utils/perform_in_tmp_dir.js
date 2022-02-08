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
exports.performInTmpDir = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
function performInTmpDir(handler) {
    return __awaiter(this, void 0, void 0, function* () {
        const tmpDir = tmp_1.default.dirSync();
        const result = yield handler(tmpDir.name);
        fs_extra_1.default.emptyDirSync(tmpDir.name);
        tmpDir.removeCallback();
        return result;
    });
}
exports.performInTmpDir = performInTmpDir;
//# sourceMappingURL=perform_in_tmp_dir.js.map