"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const tmp_1 = __importDefault(require("tmp"));
// Move to cal-versioning as we start automating CLI releases
// 2012-11-04T14:51:06.157Z -> 12.11.04145106
const version = new Date()
    .toISOString()
    .replace(/\..+/, '')
    .replace('T', '')
    .replace(':', '')
    .replace('-', '.')
    .slice(2);
const VERSION_TAG = `v${version}`;
function hasGitChanges() {
    return (0, child_process_1.execSync)(`git status --porcelain`).toString().trim().length !== 0;
}
function pushDirToRepo(opts) {
    const tmpDir = tmp_1.default.dirSync();
    process.chdir(tmpDir.name);
    (0, child_process_1.execSync)(`git clone ${opts.repo}`, { stdio: 'inherit' });
    console.log(`cloned into ${tmpDir.name}`);
    const clonedRepoPath = path_1.default.join(tmpDir.name, opts.repoName);
    process.chdir(clonedRepoPath);
    if (opts.clearExisting) {
        console.log(`clearing from ${process.cwd()}`);
        (0, child_process_1.execSync)(`find .  -mindepth 1 -maxdepth 1 ! -regex './.git' -exec rm -rf "{}" \\;`, {
            stdio: 'inherit',
        }); // delete everything but the open source git folder
    }
    console.log(`copying from ${opts.absoluteDirPath} to ${clonedRepoPath}`);
    fs_extra_1.default.copySync(opts.absoluteDirPath, clonedRepoPath); // copy over the monorepo version of the cli.
    opts.tmpMutation(clonedRepoPath);
    (0, child_process_1.execSync)(`git add -f .`, { stdio: 'inherit' }); // Include the dist which is normally ignored.
    (0, child_process_1.execSync)(`git commit -m "${VERSION_TAG}" --no-verify`, { stdio: 'inherit' });
    (0, child_process_1.execSync)(`git push origin`, { stdio: 'inherit' });
    (0, child_process_1.execSync)(`git tag -a ${VERSION_TAG} -m "${VERSION_TAG}"`, {
        stdio: 'inherit',
    });
    (0, child_process_1.execSync)(`git push origin ${VERSION_TAG}`, { stdio: 'inherit' });
    console.log(`New commit successfully created and pushed to ${opts.repo}. Remember to bump the homebrew tap to include ${VERSION_TAG}!.`);
    // Cleanup
    fs_extra_1.default.rmdirSync(tmpDir.name);
    tmpDir.removeCallback();
}
function deploy() {
    if (process.env.NEVER) {
        if (hasGitChanges()) {
            throw new Error(`Please make sure there are no uncommitted changes before deploying`);
        }
    }
    pushDirToRepo({
        absoluteDirPath: path_1.default.join(__dirname, '../../../'),
        repo: 'git@github.com:screenplaydev/graphite-cli.git',
        clearExisting: true,
        repoName: 'graphite-cli',
        tmpMutation: (dirPath) => {
            const pkg = JSON.parse(fs_extra_1.default.readFileSync(path_1.default.join(dirPath, `package.json`)).toString());
            pkg['version'] = version;
            fs_extra_1.default.writeFileSync(path_1.default.join(dirPath, './package.json'), JSON.stringify(pkg, null, 2));
            fs_extra_1.default.writeFileSync(path_1.default.join(dirPath, './dist/package.json'), JSON.stringify(pkg, null, 2));
        },
    });
    // Now bump the homebrew-tap
    pushDirToRepo({
        absoluteDirPath: path_1.default.join(__dirname, '../../../homebrew-tap/'),
        repo: 'https://github.com/screenplaydev/homebrew-tap.git',
        clearExisting: false,
        repoName: 'homebrew-tap',
        tmpMutation: () => {
            (0, child_process_1.execSync)(`yarn install`);
            (0, child_process_1.execSync)(`yarn update-graphite-cli-version ${version} --no-stable`);
        },
    });
}
deploy();
//# sourceMappingURL=deploy.js.map