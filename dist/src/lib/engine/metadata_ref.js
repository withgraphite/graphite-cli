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
exports.getMetadataRefList = exports.deleteMetadataRef = exports.readMetadataRef = exports.writeMetadataRef = exports.prInfoSchema = void 0;
const t = __importStar(require("@withgraphite/retype"));
const cute_string_1 = require("../utils/cute_string");
const run_command_1 = require("../utils/run_command");
exports.prInfoSchema = t.shape({
    number: t.optional(t.number),
    base: t.optional(t.string),
    url: t.optional(t.string),
    title: t.optional(t.string),
    body: t.optional(t.string),
    state: t.optional(t.unionMany([
        t.literal('OPEN'),
        t.literal('CLOSED'),
        t.literal('MERGED'),
    ])),
    reviewDecision: t.optional(t.unionMany([
        t.literal('APPROVED'),
        t.literal('REVIEW_REQUIRED'),
        t.literal('CHANGES_REQUESTED'),
    ])),
    isDraft: t.optional(t.boolean),
});
const metaSchema = t.shape({
    parentBranchName: t.optional(t.string),
    parentBranchRevision: t.optional(t.string),
    prInfo: t.optional(exports.prInfoSchema),
});
function writeMetadataRef(branchName, meta, cwd) {
    const metaSha = (0, run_command_1.runGitCommand)({
        args: [`hash-object`, `-w`, `--stdin`],
        options: {
            input: (0, cute_string_1.cuteString)(meta),
            cwd,
        },
        onError: 'throw',
        resource: 'hashMetadataRef',
    });
    (0, run_command_1.runGitCommand)({
        args: [`update-ref`, `refs/branch-metadata/${branchName}`, metaSha],
        options: {
            stdio: 'pipe',
            cwd,
        },
        onError: 'throw',
        resource: 'writeMetadataRef',
    });
}
exports.writeMetadataRef = writeMetadataRef;
function readMetadataRef(branchName, cwd) {
    try {
        const meta = JSON.parse((0, run_command_1.runGitCommand)({
            args: [`cat-file`, `-p`, `refs/branch-metadata/${branchName}`],
            options: {
                cwd,
            },
            onError: 'ignore',
            resource: 'readMetadataRef',
        }));
        return metaSchema(meta) ? meta : {};
    }
    catch {
        return {};
    }
}
exports.readMetadataRef = readMetadataRef;
function deleteMetadataRef(branchName) {
    (0, run_command_1.runGitCommand)({
        args: [`update-ref`, `-d`, `refs/branch-metadata/${branchName}`],
        onError: 'throw',
        resource: 'deleteMetadataRef',
    });
}
exports.deleteMetadataRef = deleteMetadataRef;
function getMetadataRefList() {
    const meta = {};
    (0, run_command_1.runGitCommandAndSplitLines)({
        args: [
            `for-each-ref`,
            `--format=%(refname:lstrip=2):%(objectname)`,
            `refs/branch-metadata/`,
        ],
        onError: 'throw',
        resource: 'getMetadataRefList',
    })
        .map((line) => line.split(':'))
        .filter((lineSplit) => lineSplit.length === 2 && lineSplit.every((s) => s.length > 0))
        .forEach(([branchName, metaSha]) => (meta[branchName] = metaSha));
    return meta;
}
exports.getMetadataRefList = getMetadataRefList;
//# sourceMappingURL=metadata_ref.js.map