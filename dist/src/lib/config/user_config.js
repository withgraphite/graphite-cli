"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const compose_config_1 = require("./compose_config");
const schema = t.shape({
    branchPrefix: t.optional(t.string),
    branchDate: t.optional(t.boolean),
    branchReplacement: t.optional(t.unionMany([t.literal('_'), t.literal('-'), t.literal('')])),
    authToken: t.optional(t.string),
    tips: t.optional(t.boolean),
    editor: t.optional(t.string),
    experimental: t.optional(t.boolean),
});
exports.userConfigFactory = compose_config_1.composeConfig({
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
    helperFunctions: () => {
        return {};
    },
});
//# sourceMappingURL=user_config.js.map