"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fakeGitSquashAndMerge = void 0;
const child_process_1 = require("child_process");
function fakeGitSquashAndMerge(repo, branchName, squashedCommitMessage) {
    // Fake github squash and merge
    (0, child_process_1.execSync)(`git -C "${repo.dir}" switch -q -c temp ${branchName}`);
    repo.checkoutBranch('temp');
    (0, child_process_1.execSync)(`git -C "${repo.dir}" rebase main -Xtheirs`, { stdio: 'ignore' });
    (0, child_process_1.execSync)(`git -C "${repo.dir}" reset --soft $(git -C "${repo.dir}" merge-base HEAD main)`);
    repo.checkoutBranch('main');
    (0, child_process_1.execSync)(`git -C "${repo.dir}" commit -m "${squashedCommitMessage}"`);
    (0, child_process_1.execSync)(`git -C "${repo.dir}" branch -D temp`);
}
exports.fakeGitSquashAndMerge = fakeGitSquashAndMerge;
//# sourceMappingURL=fake_squash_and_merge.js.map