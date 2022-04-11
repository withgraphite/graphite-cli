#! /usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const build_1 = require("./build");
function testDeploy() {
    const workDir = tmp_1.default.dirSync();
    fs_extra_1.default.copySync(".", workDir.name);
    const oldDir = process.cwd();
    process.chdir(workDir.name);
    build_1.build();
    console.log("zipping...");
    child_process_1.execSync(`zip screenplay-cli.zip . -r`, { stdio: "ignore" });
    const shasum = child_process_1.execSync("shasum -a 256 screenplay-cli.zip")
        .toString()
        .trim()
        .split(" ")[0];
    const formulaPath = `${process.cwd()}/scripts/deploy/test-formula/graphite.rb`;
    fs_extra_1.default.writeFileSync(formulaPath, fs_extra_1.default
        .readFileSync(formulaPath)
        .toString()
        .replace("<file_url>", `${process.cwd()}/screenplay-cli.zip`)
        .replace("<sha>", shasum));
    child_process_1.execSync(`brew install --build-from-source ${formulaPath}`, {
        stdio: "inherit",
    });
    process.chdir(oldDir);
    fs_extra_1.default.emptyDirSync(workDir.name);
    workDir.removeCallback();
    // expect not to fail...
    child_process_1.execSync(`${child_process_1.execSync("brew --prefix graphite").toString().trim()}/bin/gt stacks`, {
        stdio: "inherit",
    });
}
testDeploy();
//# sourceMappingURL=deploy-test.js.map