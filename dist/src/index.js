#!/usr/bin/env node
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
const tmp_1 = __importDefault(require("tmp"));
const yargs_1 = __importDefault(require("yargs"));
const amend_1 = __importDefault(require("./commands/amend"));
const demo_1 = __importDefault(require("./commands/demo"));
const diff_1 = __importDefault(require("./commands/diff"));
const fix_1 = __importDefault(require("./commands/fix"));
const log_1 = __importDefault(require("./commands/log"));
const next_or_prev_1 = require("./commands/next-or-prev");
const print_stacks_1 = __importDefault(require("./commands/print-stacks"));
const restack_1 = __importDefault(require("./commands/restack"));
const submit_1 = __importDefault(require("./commands/submit"));
const validate_1 = __importDefault(require("./commands/validate"));
const telemetry_1 = require("./lib/telemetry");
// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp_1.default.setGracefulCleanup();
process.on("uncaughtException", (err) => __awaiter(void 0, void 0, void 0, function* () {
    yield telemetry_1.logError(err);
    process.exit(1);
}));
yargs_1.default
    .command("next", "If you're in a stack: Branch A → Branch B (you are here) → Branch C. Takes you to the next branch (Branch C). If there are two descendent branches, errors out and tells you the various branches you could go to.", next_or_prev_1.NextCommand.args, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield new next_or_prev_1.NextCommand().execute(argv);
}))
    .command("prev", "If you're in a stack: Branch A → Branch B (you are here) → Branch C. Takes you to the previous branch (Branch A). If there are two ancestral branches, errors out and tells you the various branches you could go to.", next_or_prev_1.PrevCommand.args, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield new next_or_prev_1.PrevCommand().execute(argv);
}))
    .command("diff", "Takes the current changes and creates a new branch off of whatever branch you were previously working on.", diff_1.default.args, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield new diff_1.default().execute(argv);
}))
    .command("amend", "Given the current changes, adds it to the current branch (identical to git commit) and restacks anything upstream (see below).", amend_1.default.args, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield new amend_1.default().execute(argv);
}))
    .command("submit", false, submit_1.default.args, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield new submit_1.default().execute(argv);
}))
    .command("stacks", "Prints all current stacks.", print_stacks_1.default.args, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield new print_stacks_1.default().execute(argv);
}))
    .command("log", "Prints the current state of the world", log_1.default.args, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield new log_1.default().execute(argv);
}))
    .command("fix", "Trace the current branch through its parents, down to the base branch. Establish dependencies between each branch for later traversal and restacking.", fix_1.default.args, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield new fix_1.default().execute(argv);
}))
    .command("restack", "Restacks any dependent branches onto the latest commit in a branch.", restack_1.default.args, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield new restack_1.default().execute(argv);
}))
    .command("validate", "Validates that the sd meta graph matches the current graph of git branches and commits.", validate_1.default.args, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield new validate_1.default().execute(argv);
}))
    .command("demo", false, demo_1.default.args, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield new demo_1.default().execute(argv);
}))
    .usage(["This CLI helps you manage stacked diffs."].join("\n"))
    .strict()
    .demandCommand().argv;
//# sourceMappingURL=index.js.map