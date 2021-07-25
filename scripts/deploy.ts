#! /usr/bin/env ts-node

import { execSync } from "child_process";
import { version } from "../package.json";

const VERSION_TAG = `v${version}`;
const VERSION_BRANCH = `deploy--${VERSION_TAG}`;

function hasGitChanges(): boolean {
  return execSync(`git status --porcelain`).toString().trim().length !== 0;
}

function versionExists(): boolean {
  execSync(`git fetch --tags`);
  const existingTags = execSync(`git tag`).toString().trim().split("\n");
  return existingTags.includes(VERSION_TAG);
}

function deploy() {
  if (hasGitChanges()) {
    throw new Error(
      `Please make sure there are no uncommitted changes before deploying`
    );
  }
  if (versionExists()) {
    throw new Error(
      `There already exists a tag for ${VERSION_TAG}. Please increment the package version and try again.`
    );
  }
  execSync(`yarn install --immutable`);
  execSync(`yarn build`);
  execSync(`rm -rf ./node_modules`);
  execSync(`rm -rf ./dist/test ./dist/scripts`);
  execSync(`git checkout -b ${VERSION_BRANCH}`);
  execSync(`git add -f ./dist`);
  execSync(`git commit -m "${VERSION_TAG}" --no-verify`);
  execSync(`git push origin ${VERSION_BRANCH}`);
  execSync(`git tag -a ${VERSION_TAG} -m "${VERSION_TAG}"`);
  execSync(`git push origin ${VERSION_TAG}`);

  console.log(
    `Branch ${VERSION_BRANCH} successfully created and pushed. Remember to bump the homebrew tap to include ${VERSION_TAG}!.`
  );
}

deploy();
