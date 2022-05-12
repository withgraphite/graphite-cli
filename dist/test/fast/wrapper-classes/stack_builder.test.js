"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const branch_1 = require("../../../src/wrapper-classes/branch");
const git_stack_builder_1 = require("../../../src/wrapper-classes/git_stack_builder");
const meta_stack_builder_1 = require("../../../src/wrapper-classes/meta_stack_builder");
const stack_1 = require("../../../src/wrapper-classes/stack");
const all_scenes_1 = require("../../lib/scenes/all_scenes");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of all_scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): stack builder class`, function () {
        configure_test_1.configureTest(this, scene);
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
            const gitStacks = new git_stack_builder_1.GitStackBuilder().allStacks(scene.context);
            const metaStacks = new meta_stack_builder_1.MetaStackBuilder().allStacks(scene.context);
            chai_1.expect(gitStacks[0].equals(stack_1.Stack.fromMap({ main: { d: {}, a: { b: { c: {} } } } }))).to.be.true;
            // Expect default meta to be 4 stacks of 1 off main.
            chai_1.expect(metaStacks[0].equals(stack_1.Stack.fromMap({ main: { a: {} } })));
            chai_1.expect(metaStacks[1].equals(stack_1.Stack.fromMap({ main: { b: {} } })));
            chai_1.expect(metaStacks[2].equals(stack_1.Stack.fromMap({ main: { c: {} } })));
            chai_1.expect(metaStacks[3].equals(stack_1.Stack.fromMap({ main: { d: {} } })));
        });
        it('Can print stacks from meta', () => {
            scene.repo.createChange('a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('d');
            scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
            const metaStacks = new meta_stack_builder_1.MetaStackBuilder().allStacks(scene.context);
            const gitStacks = new git_stack_builder_1.GitStackBuilder().allStacks(scene.context);
            chai_1.expect(metaStacks[0].equals(stack_1.Stack.fromMap({ main: { d: {}, a: { b: {} } } }))).to.be.true;
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
            const metaStack = new meta_stack_builder_1.MetaStackBuilder().fullStackFromBranch(new branch_1.Branch('a'), scene.context);
            const gitStack = new git_stack_builder_1.GitStackBuilder().fullStackFromBranch(new branch_1.Branch('a'), scene.context);
            chai_1.expect(metaStack.equals(stack_1.Stack.fromMap({ main: { a: { b: {} } } }))).to.be
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
            const metaStack = new meta_stack_builder_1.MetaStackBuilder().fullStackFromBranch(new branch_1.Branch('main'), scene.context);
            const gitStack = new git_stack_builder_1.GitStackBuilder().fullStackFromBranch(new branch_1.Branch('main'), scene.context);
            chai_1.expect(metaStack.equals(stack_1.Stack.fromMap({ main: { a: { b: {} }, d: {} } })))
                .to.be.true;
            chai_1.expect(gitStack.equals(metaStack)).to.be.true;
        });
        it('Can find different git and meta stacks', () => {
            scene.repo.createChange('a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.createChangeAndCommit('b');
            const metaStack = new meta_stack_builder_1.MetaStackBuilder().fullStackFromBranch(new branch_1.Branch('a'), scene.context);
            const gitStack = new git_stack_builder_1.GitStackBuilder().fullStackFromBranch(new branch_1.Branch('a'), scene.context);
            chai_1.expect(metaStack.equals(stack_1.Stack.fromMap({ main: { a: {} } }))).to.be.true;
            chai_1.expect(gitStack.equals(stack_1.Stack.fromMap({ a: {} }))).to.be.true;
        });
        it('Can get just downstack from a branch', () => {
            scene.repo.createChange('a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.createChange('c');
            scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
            const metaStack = new meta_stack_builder_1.MetaStackBuilder().downstackFromBranch(new branch_1.Branch('b'), scene.context);
            const gitStack = new git_stack_builder_1.GitStackBuilder().downstackFromBranch(new branch_1.Branch('b'), scene.context);
            chai_1.expect(metaStack.equals(stack_1.Stack.fromMap({ main: { a: { b: {} } } }))).to.be
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
            const metaStack = new meta_stack_builder_1.MetaStackBuilder().fullStackFromBranch(new branch_1.Branch('b'), scene.context);
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
            const metaStack = new meta_stack_builder_1.MetaStackBuilder().fullStackFromBranch(new branch_1.Branch('a'), scene.context);
            const gitStack = new git_stack_builder_1.GitStackBuilder().fullStackFromBranch(new branch_1.Branch('a'), scene.context);
            chai_1.expect(metaStack.equals(stack_1.Stack.fromMap({ main: { a: { b: {}, c: {} } } })))
                .to.be.true;
            chai_1.expect(metaStack.equals(gitStack)).to.be.true;
        });
    });
}
//# sourceMappingURL=stack_builder.test.js.map