"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class MetaStackBuilder extends _1.AbstractStackBuilder {
    getBranchParent(branch) {
        return branch.getParentFromMeta();
    }
    getChildrenForBranch(branch) {
        return branch.getChildrenFromMeta();
    }
    getParentForBranch(branch) {
        return branch.getParentFromMeta();
    }
}
exports.default = MetaStackBuilder;
//# sourceMappingURL=meta_stack_builder.js.map