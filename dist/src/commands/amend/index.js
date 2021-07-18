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
const child_process_1 = require("child_process");
const abstract_command_1 = __importDefault(require("../abstract_command"));
const restack_1 = __importDefault(require("../restack"));
const args = {
    message: {
        type: "string",
        alias: "m",
        describe: "The message for the new commit",
    },
    silent: {
        describe: `silence output from the command`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "s",
    },
};
class AmendCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            child_process_1.execSync("git add --all");
            child_process_1.execSync(`git commit -m "${argv.message || "Updates"}"`);
            yield new restack_1.default().executeUnprofiled(args);
        });
    }
}
exports.default = AmendCommand;
AmendCommand.args = args;
//# sourceMappingURL=index.js.map