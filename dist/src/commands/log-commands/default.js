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
exports.handler = exports.canonical = exports.builder = exports.description = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const print_stack_1 = require("../../actions/print_stack");
const config_1 = require("../../lib/config");
const telemetry_1 = require("../../lib/telemetry");
const trunk_1 = require("../../lib/utils/trunk");
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const args = {
    'on-trunk': {
        describe: `Only show commits on trunk`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 't',
    },
    'behind-trunk': {
        describe: `Only show commits behind trunk`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'b',
    },
};
exports.command = '*';
exports.description = 'Log all stacks tracked by Graphite.';
exports.builder = args;
exports.canonical = 'log';
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        // Use our custom logging of branches and stacks:
        if (argv['on-trunk']) {
            printTrunkLog();
        }
        else if (argv['behind-trunk']) {
            yield printStacksBehindTrunk();
        }
        else {
            printTrunkLog();
            yield printStacksBehindTrunk();
        }
    }));
});
exports.handler = handler;
function printTrunkLog() {
    const trunk = trunk_1.getTrunk();
    print_stack_1.printStack({
        baseBranch: trunk.useMemoizedResults(),
        indentLevel: 0,
        config: {
            currentBranch: branch_1.default.getCurrentBranch(),
            offTrunk: true,
            visited: [],
        },
    });
}
function printStacksBehindTrunk() {
    return __awaiter(this, void 0, void 0, function* () {
        const trunk = trunk_1.getTrunk();
        const branchesWithoutParents = yield branch_1.default.getAllBranchesWithoutParents({
            useMemoizedResults: true,
            maxDaysBehindTrunk: config_1.repoConfig.getMaxDaysShownBehindTrunk(),
            maxBranches: config_1.repoConfig.getMaxStacksShownBehindTrunk(),
            excludeTrunk: true,
        });
        if (branchesWithoutParents.length === 0) {
            return;
        }
        console.log('․');
        console.log('․');
        console.log(`․  ${chalk_1.default.bold(`Stack(s) below trail ${trunk.name}.`)}`);
        console.log(`․  To fix a stack, check out the stack and run \`gt stack fix\`.`);
        console.log('․');
        branchesWithoutParents.forEach((branch) => {
            console.log('․');
            print_stack_1.printStack({
                baseBranch: branch.useMemoizedResults(),
                indentLevel: 1,
                config: {
                    currentBranch: branch_1.default.getCurrentBranch(),
                    offTrunk: false,
                    visited: [],
                },
            });
            console.log(`◌──┘`);
            console.log('․');
        });
    });
}
//# sourceMappingURL=default.js.map