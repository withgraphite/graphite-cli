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
exports.userConfigFactory = void 0;
const t = __importStar(require("@withgraphite/retype"));
const git_editor_1 = require("../git/git_editor");
const spiffy_1 = require("./spiffy");
const schema = t.shape({
    branchPrefix: t.optional(t.string),
    branchDate: t.optional(t.boolean),
    branchReplacement: t.optional(t.unionMany([t.literal('_'), t.literal('-'), t.literal('')])),
    authToken: t.optional(t.string),
    tips: t.optional(t.boolean),
    editor: t.optional(t.string),
    restackCommitterDateIsAuthorDate: t.optional(t.boolean),
});
exports.userConfigFactory = (0, spiffy_1.spiffy)({
    schema,
    defaultLocations: [
        {
            relativePath: '.graphite_user_config',
            relativeTo: 'USER_HOME',
        },
    ],
    initialize: () => {
        return {};
    },
    helperFunctions: (data) => {
        return {
            getEditor: () => {
                // If we don't have an editor set, do what git would do
                return (data.editor ??
                    (0, git_editor_1.getGitEditor)() ??
                    process.env.GIT_EDITOR ??
                    process.env.EDITOR ??
                    'vi');
            },
        };
    },
});
//# sourceMappingURL=user_config_spf.js.map