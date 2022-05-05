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
exports.pushMetadata = void 0;
const chalk_1 = __importDefault(require("chalk"));
const errors_1 = require("../../lib/errors");
const utils_1 = require("../../lib/utils");
const wrapper_classes_1 = require("../../wrapper-classes");
function pushMetadata(branchesPushedToRemote, context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!context.userConfig.data.experimental) {
            return;
        }
        utils_1.logInfo(chalk_1.default.blueBright(`➡️ [Step 5] Updating remote stack metadata...`));
        if (!branchesPushedToRemote.length) {
            utils_1.logInfo(`No branches were pushed to remote.`);
            utils_1.logNewline();
            return;
        }
        const remote = context.repoConfig.getRemote();
        branchesPushedToRemote.forEach((branch) => {
            utils_1.logInfo(`Setting source of truth stack metadata for ${chalk_1.default.green(branch.name)}...`);
            utils_1.gpExecSync({
                command: `git push origin "+refs/branch-metadata/${branch.name}:refs/branch-metadata/${branch.name}"`,
                options: {
                    printStdout: true,
                },
            }, (err) => {
                utils_1.logError(`Failed to push stack metadata for ${branch.name} to remote.`);
                throw new errors_1.ExitFailedError(err.stderr.toString());
            });
            wrapper_classes_1.MetadataRef.copyMetadataRefToRemoteTracking(remote, branch.name);
        });
    });
}
exports.pushMetadata = pushMetadata;
//# sourceMappingURL=push_metadata.js.map