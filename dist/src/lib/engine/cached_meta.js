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
exports.assertCachedMetaIsValidAndNotTrunk = exports.assertCachedMetaIsNotTrunk = exports.assertCachedMetaIsValidOrTrunk = exports.cachedMetaSchema = void 0;
const t = __importStar(require("@withgraphite/retype"));
const errors_1 = require("../errors");
const metadata_ref_1 = require("./metadata_ref");
exports.cachedMetaSchema = t.intersection(t.shape({
    children: t.array(t.string),
    branchRevision: t.string,
    prInfo: t.optional(metadata_ref_1.prInfoSchema),
}), t.taggedUnion('validationResult', {
    VALID: {
        validationResult: t.literal('VALID'),
        parentBranchName: t.string,
        parentBranchRevision: t.string,
    },
    INVALID_PARENT: {
        validationResult: t.literal('INVALID_PARENT'),
        parentBranchName: t.string,
        parentBranchRevision: t.optional(t.string),
    },
    BAD_PARENT_REVISION: {
        validationResult: t.literal('BAD_PARENT_REVISION'),
        parentBranchName: t.string,
    },
    BAD_PARENT_NAME: {
        validationResult: t.literal('BAD_PARENT_NAME'),
    },
    TRUNK: {
        validationResult: t.literal('TRUNK'),
    },
}));
function assertCachedMetaIsValidOrTrunk(meta) {
    if (meta.validationResult !== 'VALID' && meta.validationResult !== 'TRUNK') {
        throw new errors_1.UntrackedBranchError();
    }
}
exports.assertCachedMetaIsValidOrTrunk = assertCachedMetaIsValidOrTrunk;
function assertCachedMetaIsNotTrunk(meta) {
    if (meta.validationResult === 'TRUNK') {
        throw new errors_1.BadTrunkOperationError();
    }
}
exports.assertCachedMetaIsNotTrunk = assertCachedMetaIsNotTrunk;
function assertCachedMetaIsValidAndNotTrunk(meta) {
    assertCachedMetaIsValidOrTrunk(meta);
    assertCachedMetaIsNotTrunk(meta);
}
exports.assertCachedMetaIsValidAndNotTrunk = assertCachedMetaIsValidAndNotTrunk;
//# sourceMappingURL=cached_meta.js.map