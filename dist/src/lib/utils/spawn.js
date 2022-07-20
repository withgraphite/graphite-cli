"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawnDetached = void 0;
const child_process_1 = __importDefault(require("child_process"));
// Spawns an async process that executes the specified file
function spawnDetached(filename, args = []) {
    child_process_1.default.spawn(process.argv[0], [filename, ...args], {
        detached: true,
        stdio: 'ignore',
    }).unref();
}
exports.spawnDetached = spawnDetached;
//# sourceMappingURL=spawn.js.map