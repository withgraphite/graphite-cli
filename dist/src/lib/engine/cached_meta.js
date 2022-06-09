"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertCachedMetaIsValidAndNotTrunk = exports.assertCachedMetaIsNotTrunk = exports.assertCachedMetaIsValidOrTrunk = void 0;
const errors_1 = require("../errors");
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