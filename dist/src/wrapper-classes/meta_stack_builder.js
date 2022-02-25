"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class MetaStackBuilder extends _1.AbstractStackBuilder {
    getBranchParent(branch, context) {
        return branch.getParentFromMeta(context);
    }
    getChildrenForBranch(branch, context) {
        return branch.getChildrenFromMeta(context);
    }
    getParentForBranch(branch, context) {
        return branch.getParentFromMeta(context);
    }
}
exports.default = MetaStackBuilder;
//# sourceMappingURL=meta_stack_builder.js.map