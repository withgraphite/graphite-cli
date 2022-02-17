"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const wrapper_classes_1 = require("../../../src/wrapper-classes");
const branch_1 = __importDefault(require("../../../src/wrapper-classes/branch"));
const scenes_1 = require("../../lib/scenes");
const utils_1 = require("../../lib/utils");
for (const scene of scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): stack builder class`, function () {
        utils_1.configureTest(this, scene);
        it('Can print stacks from git', () => {
            scene.repo.createAndCheckoutBranch('a');
            scene.repo.createChangeAndCommit('a');
            scene.repo.createAndCheckoutBranch('b');
            scene.repo.createChangeAndCommit('b');
            scene.repo.createAndCheckoutBranch('c');
            scene.repo.createChangeAndCommit('c');
            scene.repo.checkoutBranch('main');
            scene.repo.createAndCheckoutBranch('d');
            scene.repo.createChangeAndCommit('d');
            const gitStacks = new wrapper_classes_1.GitStackBuilder().allStacks();
            const metaStacks = new wrapper_classes_1.MetaStackBuilder().allStacks();
            chai_1.expect(gitStacks[0].equals(wrapper_classes_1.Stack.fromMap({ main: { d: {}, a: { b: { c: {} } } } }))).to.be.true;
            // Expect default meta to be 4 stacks of 1 off main.
            chai_1.expect(metaStacks[0].equals(wrapper_classes_1.Stack.fromMap({ main: { a: {} } })));
            chai_1.expect(metaStacks[1].equals(wrapper_classes_1.Stack.fromMap({ main: { b: {} } })));
            chai_1.expect(metaStacks[2].equals(wrapper_classes_1.Stack.fromMap({ main: { c: {} } })));
            chai_1.expect(metaStacks[3].equals(wrapper_classes_1.Stack.fromMap({ main: { d: {} } })));
        });
        it('Can print stacks from meta', () => {
            scene.repo.createChange('a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('d');
            scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
            const metaStacks = new wrapper_classes_1.MetaStackBuilder().allStacks();
            const gitStacks = new wrapper_classes_1.GitStackBuilder().allStacks();
            chai_1.expect(metaStacks[0].equals(wrapper_classes_1.Stack.fromMap({ main: { d: {}, a: { b: {} } } }))).to.be.true;
            // Expect git and meta stacks to equal
            chai_1.expect(gitStacks[0].equals(metaStacks[0])).to.be.true;
        });
        it('Can get full stack from a branch', () => {
            scene.repo.createChange('a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('d');
            scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
            const metaStack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(new branch_1.default('a'));
            const gitStack = new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(new branch_1.default('a'));
            chai_1.expect(metaStack.equals(wrapper_classes_1.Stack.fromMap({ main: { a: { b: {} } } }))).to.be
                .true;
            chai_1.expect(metaStack.equals(gitStack)).to.be.true;
        });
        it('Can get full stack from trunk', () => {
            scene.repo.createChange('a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('d');
            scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
            const metaStack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(new branch_1.default('main'));
            const gitStack = new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(new branch_1.default('main'));
            chai_1.expect(metaStack.equals(wrapper_classes_1.Stack.fromMap({ main: { a: { b: {} }, d: {} } })))
                .to.be.true;
            chai_1.expect(gitStack.equals(metaStack)).to.be.true;
        });
        it('Can find different git and meta stacks', () => {
            scene.repo.createChange('a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.createChangeAndCommit('b');
            const metaStack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(new branch_1.default('a'));
            const gitStack = new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(new branch_1.default('a'));
            chai_1.expect(metaStack.equals(wrapper_classes_1.Stack.fromMap({ main: { a: {} } }))).to.be.true;
            chai_1.expect(gitStack.equals(wrapper_classes_1.Stack.fromMap({ a: {} }))).to.be.true;
        });
        it('Can get just downstack from a branch', () => {
            scene.repo.createChange('a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.createChange('c');
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            const metaStack = new wrapper_classes_1.MetaStackBuilder().downstackFromBranch(new branch_1.default('b'));
            const gitStack = new wrapper_classes_1.GitStackBuilder().downstackFromBranch(new branch_1.default('b'));
            chai_1.expect(metaStack.equals(wrapper_classes_1.Stack.fromMap({ main: { a: { b: {} } } }))).to.be
                .true;
            chai_1.expect(metaStack.equals(gitStack)).to.be.true;
        });
        it('Can get branchs from a stack', () => {
            scene.repo.createChange('a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.createChange('c');
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            const metaStack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(new branch_1.default('b'));
            chai_1.expect(metaStack
                .branches()
                .map((b) => b.name)
                .join(', ')).equals('main, a, b, c');
        });
        it('Merge logic is consistent between git and meta', () => {
            // Give the filenames prefixes so we won't run into merge conflicts when
            // we do the merge.
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b', 'b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.checkoutBranch('a');
            scene.repo.createChange('c', 'c');
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            scene.repo.mergeBranch({ branch: 'c', mergeIn: 'b' });
            // The git graph now looks like:
            //
            // C
            // |\
            // | B
            // |/
            // A
            const metaStack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(new branch_1.default('a'));
            const gitStack = new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(new branch_1.default('a'));
            chai_1.expect(metaStack.equals(wrapper_classes_1.Stack.fromMap({ main: { a: { b: {}, c: {} } } })))
                .to.be.true;
            chai_1.expect(metaStack.equals(gitStack)).to.be.true;
        });
    });
}
//# sourceMappingURL=stack_builder.test.js.map