"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.continueConfigFactory = void 0;
const t = __importStar(require("@withgraphite/retype"));
const compose_config_1 = require("./compose_config");
/**
 * After Graphite is interrupted by a merge conflict, upon continuing, there
 * are 3 main things we need to do, in the following order.
 *
 * 1) Complete the original rebase operation.
 * 2) Sync any remaining branches from remote.
 * 3) Restack any remaining branches that were queued.
 *
 * The below object persists the queue of branches to be restacked.
 * We also store the Graphite current branch, so that we can switch back to it.
 * We need to keep track of the new parentBranchRevision for the branch that
 * hit a merge conflict, as we cannot pull this information from Git.
 */
const ContinueSchema = t.shape({
    branchesToSync: t.array(t.string),
    branchesToRestack: t.array(t.string),
    currentBranchOverride: t.optional(t.string),
    rebasedBranchBase: t.optional(t.string),
});
exports.continueConfigFactory = (0, compose_config_1.composeConfig)({
    schema: ContinueSchema,
    defaultLocations: [
        {
            relativePath: '.gtcontinue',
            relativeTo: 'REPO',
        },
    ],
    initialize: () => {
        return { branchNames: [] };
    },
    helperFunctions: () => {
        return {};
    },
    options: { removeIfEmpty: true, removeIfInvalid: true },
});
//# sourceMappingURL=continue_config.js.map