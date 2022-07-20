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
exports.cachePersistenceFactory = void 0;
const t = __importStar(require("@withgraphite/retype"));
const cached_meta_1 = require("../engine/cached_meta");
const spiffy_1 = require("./spiffy");
exports.cachePersistenceFactory = (0, spiffy_1.spiffy)({
    schema: t.shape({
        sha: (sha) => t.string(sha) && sha.length === 40,
        branches: t.array(t.tuple([t.string, cached_meta_1.cachedMetaSchema])),
    }),
    defaultLocations: [
        {
            relativePath: '.graphite_cache_persist',
            relativeTo: 'REPO',
        },
    ],
    initialize: () => {
        return {};
    },
    helperFunctions: () => {
        return {};
    },
    options: { removeIfEmpty: true, removeIfInvalid: true },
});
//# sourceMappingURL=cache_spf.js.map