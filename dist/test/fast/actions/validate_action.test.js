"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const validate_1 = require("../../../src/actions/validate");
const config_1 = require("../../../src/lib/config");
const scenes_1 = require("../../lib/scenes");
const utils_1 = require("../../lib/utils");
const wrapper_classes_1 = require("../../../src/wrapper-classes");
const preconditions_1 = require("../../../src/lib/preconditions");
function setupScene(scene) {
    scene.repo.createChange('a');
    scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
    scene.repo.createAndCheckoutBranch('b');
    scene.repo.createChangeAndCommit('1');
    scene.repo.createChange('c');
    scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
    scene.repo.createChange('d');
    scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
}
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): validate action`, function () {
        utils_1.configureTest(this, scene);
        it('Can validate upstack', () => __awaiter(this, void 0, void 0, function* () {
            setupScene(scene);
            let branch;
            let stack;
            scene.repo.checkoutBranch('a');
            chai_1.expect(() => validate_1.validate('UPSTACK')).to.throw(Error);
            branch = preconditions_1.currentBranchPrecondition();
            stack = new wrapper_classes_1.MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
            chai_1.expect(() => validate_1.validateStack('UPSTACK', stack)).to.throw(Error);
            scene.repo.checkoutBranch('b');
            chai_1.expect(() => validate_1.validate('UPSTACK')).to.not.throw(Error);
            branch = preconditions_1.currentBranchPrecondition();
            stack = new wrapper_classes_1.MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
            chai_1.expect(() => validate_1.validateStack('UPSTACK', stack)).to.not.throw(Error);
            scene.repo.checkoutBranch('c');
            chai_1.expect(() => validate_1.validate('UPSTACK')).to.not.throw(Error);
            branch = preconditions_1.currentBranchPrecondition();
            stack = new wrapper_classes_1.MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
            chai_1.expect(() => validate_1.validateStack('UPSTACK', stack)).to.not.throw(Error);
            scene.repo.checkoutBranch('d');
            chai_1.expect(() => validate_1.validate('UPSTACK')).to.not.throw(Error);
            branch = preconditions_1.currentBranchPrecondition();
            stack = new wrapper_classes_1.MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
            chai_1.expect(() => validate_1.validateStack('UPSTACK', stack)).to.not.throw(Error);
        }));
        it('Can validate downstack', () => __awaiter(this, void 0, void 0, function* () {
            setupScene(scene);
            let branch;
            let metaStack;
            scene.repo.checkoutBranch('a');
            chai_1.expect(() => validate_1.validate('DOWNSTACK')).to.not.throw(Error);
            branch = preconditions_1.currentBranchPrecondition();
            metaStack = new wrapper_classes_1.MetaStackBuilder().downstackFromBranch(branch);
            chai_1.expect(() => validate_1.validateStack('DOWNSTACK', metaStack)).to.not.throw(Error);
            scene.repo.checkoutBranch('b');
            chai_1.expect(() => validate_1.validate('DOWNSTACK')).to.throw(Error);
            branch = preconditions_1.currentBranchPrecondition();
            metaStack = new wrapper_classes_1.MetaStackBuilder().downstackFromBranch(branch);
            chai_1.expect(() => validate_1.validateStack('DOWNSTACK', metaStack)).to.throw(Error);
            scene.repo.checkoutBranch('c');
            chai_1.expect(() => validate_1.validate('DOWNSTACK')).to.throw(Error);
            branch = preconditions_1.currentBranchPrecondition();
            metaStack = new wrapper_classes_1.MetaStackBuilder().downstackFromBranch(branch);
            chai_1.expect(() => validate_1.validateStack('DOWNSTACK', metaStack)).to.throw(Error);
            scene.repo.checkoutBranch('d');
            chai_1.expect(() => validate_1.validate('DOWNSTACK')).to.throw(Error);
            branch = preconditions_1.currentBranchPrecondition();
            metaStack = new wrapper_classes_1.MetaStackBuilder().downstackFromBranch(branch);
            chai_1.expect(() => validate_1.validateStack('DOWNSTACK', metaStack)).to.throw(Error);
        }));
        it('Can validate fullstack', () => __awaiter(this, void 0, void 0, function* () {
            let branch;
            let metaStack;
            scene.repo.createChange('a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            config_1.cache.clearAll();
            chai_1.expect(() => validate_1.validate('FULLSTACK')).to.not.throw(Error);
            branch = preconditions_1.currentBranchPrecondition();
            metaStack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(branch);
            chai_1.expect(() => validate_1.validateStack('FULLSTACK', metaStack)).to.not.throw(Error);
            scene.repo.createChange('b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            config_1.cache.clearAll();
            chai_1.expect(() => validate_1.validate('FULLSTACK')).to.not.throw(Error);
            branch = preconditions_1.currentBranchPrecondition();
            metaStack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(branch);
            chai_1.expect(() => validate_1.validateStack('FULLSTACK', metaStack)).to.not.throw(Error);
            scene.repo.createAndCheckoutBranch('c');
            scene.repo.createChangeAndCommit('c');
            config_1.cache.clearAll();
            chai_1.expect(() => validate_1.validate('FULLSTACK')).to.throw(Error);
            branch = preconditions_1.currentBranchPrecondition();
            metaStack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(branch);
            chai_1.expect(() => validate_1.validateStack('FULLSTACK', metaStack)).to.throw(Error);
        }));
    });
}
//# sourceMappingURL=validate_action.test.js.map