#! /usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const package_json_1 = require("../../package.json");
const build_1 = require("./build");
const VERSION_TAG = `v${package_json_1.version}`;
const VERSION_BRANCH = `deploy--${VERSION_TAG}`;
function hasGitChanges() {
    return child_process_1.execSync(`git status --porcelain`).toString().trim().length !== 0;
}
function versionExists() {
    child_process_1.execSync(`git fetch --tags`);
    const existingTags = child_process_1.execSync(`git tag`).toString().trim().split("\n");
    return existingTags.includes(VERSION_TAG);
}
function deploy() {
    if (hasGitChanges()) {
        throw new Error(`Please make sure there are no uncommitted changes before deploying`);
    }
    if (versionExists()) {
        throw new Error(`There already exists a tag for ${VERSION_TAG}. Please increment the package version and try again.`);
    }
    build_1.build();
    child_process_1.execSync(`git checkout -b ${VERSION_BRANCH}`);
    child_process_1.execSync(`git add -f ./dist`);
    child_process_1.execSync(`git commit -m "${VERSION_TAG}" --no-verify`);
    child_process_1.execSync(`git push origin ${VERSION_BRANCH}`);
    child_process_1.execSync(`git tag -a ${VERSION_TAG} -m "${VERSION_TAG}"`);
    child_process_1.execSync(`git push origin ${VERSION_TAG}`);
    console.log(`Branch ${VERSION_BRANCH} successfully created and pushed. Remember to bump the homebrew tap to include ${VERSION_TAG}!.`);
}
deploy();
//# sourceMappingURL=deploy.js.map