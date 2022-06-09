"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOrFixParentBranchRevision = exports.parseBranchesAndMeta = void 0;
const merge_base_1 = require("../git/merge_base");
const metadata_ref_1 = require("./metadata_ref");
function getAllBranchesAndMeta(args, splog) {
    const branchesWithMeta = new Set(args.metaRefNames.filter((branchName) => {
        if (args.gitBranchNamesAndRevisions[branchName]) {
            return true;
        }
        if (!args.pruneMeta) {
            return false;
        }
        // Clean up refs whose branch is missing
        splog.debug(`Deleting metadata for missing branch: ${branchName}`);
        (0, metadata_ref_1.deleteMetadataRef)(branchName);
        return false;
    }));
    return Object.keys(args.gitBranchNamesAndRevisions).map((branchName) => ({
        branchName,
        branchRevision: args.gitBranchNamesAndRevisions[branchName],
        ...(branchesWithMeta.has(branchName) ? (0, metadata_ref_1.readMetadataRef)(branchName) : {}),
    }));
}
function parseBranchesAndMeta(args, splog) {
    const branchesToParse = getAllBranchesAndMeta(args, splog);
    const allBranchNames = new Set(branchesToParse.map((meta) => meta.branchName));
    const parsedBranches = {};
    splog.debug('Validating branches...');
    while (branchesToParse.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const current = branchesToParse.shift();
        const { branchName, branchRevision, parentBranchName, parentBranchRevision, prInfo, } = current;
        if (branchName === args.trunkName) {
            splog.debug(`trunk: ${branchName}`);
            parsedBranches[branchName] = {
                validationResult: 'TRUNK',
                branchRevision: branchRevision,
                children: [],
            };
            continue;
        }
        // Check parentBranchName
        if (!parentBranchName ||
            parentBranchName === branchName ||
            !allBranchNames.has(parentBranchName)) {
            splog.debug(`bad parent name: ${branchName}\n\t${parentBranchName ?? 'missing'}`);
            parsedBranches[branchName] = {
                validationResult: 'BAD_PARENT_NAME',
                branchRevision,
                prInfo,
                children: [],
            };
            continue;
        }
        // If parent hasn't been checked yet, we'll come back to this branch
        if (typeof parsedBranches[parentBranchName] === 'undefined') {
            branchesToParse.push(current);
            continue;
        }
        parsedBranches[parentBranchName].children.push(branchName);
        // Check if the parent is valid (or trunk)
        if (!['VALID', 'TRUNK'].includes(parsedBranches[parentBranchName].validationResult)) {
            splog.debug(`invalid parent: ${branchName}`);
            parsedBranches[branchName] = {
                validationResult: 'INVALID_PARENT',
                parentBranchName,
                parentBranchRevision,
                branchRevision,
                prInfo,
                children: [],
            };
            continue;
        }
        // If we make it here, we just need to validate the parent branch revision!
        const result = validateOrFixParentBranchRevision({
            ...current,
            parentBranchCurrentRevision: parsedBranches[parentBranchName].branchRevision,
        }, splog);
        parsedBranches[branchName] = {
            ...{
                parentBranchName,
                branchRevision,
                prInfo,
                children: [],
            },
            ...result,
        };
    }
    return parsedBranches;
}
exports.parseBranchesAndMeta = parseBranchesAndMeta;
function validateOrFixParentBranchRevision({ branchName, parentBranchName, parentBranchRevision, prInfo, parentBranchCurrentRevision, }, splog) {
    // This branch is valid because its PBR is in its history
    if (parentBranchRevision &&
        (0, merge_base_1.getMergeBase)(branchName, parentBranchRevision) === parentBranchRevision) {
        splog.debug(`validated: ${branchName}`);
        return { validationResult: 'VALID', parentBranchRevision };
    }
    // PBR cannot be fixed because its parent is not in its history
    if ((0, merge_base_1.getMergeBase)(branchName, parentBranchName) !== parentBranchName) {
        splog.debug(`bad parent rev: ${branchName}\n\t${parentBranchRevision ?? 'missing'}`);
        return { validationResult: 'BAD_PARENT_REVISION' };
    }
    // PBR can be fixed because we see the parent in the branch's history
    (0, metadata_ref_1.writeMetadataRef)(branchName, {
        parentBranchName,
        parentBranchRevision: parentBranchCurrentRevision,
        prInfo,
    });
    splog.debug(`validated and fixed parent rev: ${branchName}\n\t${parentBranchCurrentRevision}`);
    return {
        validationResult: 'VALID',
        parentBranchRevision: parentBranchCurrentRevision,
    };
}
exports.validateOrFixParentBranchRevision = validateOrFixParentBranchRevision;
//# sourceMappingURL=parse_branches_and_meta.js.map