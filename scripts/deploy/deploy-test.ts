#! /usr/bin/env ts-node
import { execSync } from "child_process";
import fs from "fs-extra";
import tmp from "tmp";
import { build } from "./build";

function testDeploy() {
  const workDir = tmp.dirSync();
  fs.copySync(".", workDir.name);
  const oldDir = process.cwd();
  process.chdir(workDir.name);

  build();

  console.log("zipping...");
  execSync(`zip screenplay-cli.zip . -r`, { stdio: "ignore" });
  const shasum = execSync("shasum -a 256 screenplay-cli.zip")
    .toString()
    .trim()
    .split(" ")[0];

  const formulaPath = `${process.cwd()}/scripts/deploy/test-formula/graphite.rb`;
  fs.writeFileSync(
    formulaPath,
    fs
      .readFileSync(formulaPath)
      .toString()
      .replace("<file_url>", `${process.cwd()}/screenplay-cli.zip`)
      .replace("<sha>", shasum)
  );

  execSync(`brew install --build-from-source ${formulaPath}`, {
    stdio: "inherit",
  });

  process.chdir(oldDir);

  fs.emptyDirSync(workDir.name);
  workDir.removeCallback();

  // expect not to fail...
  execSync(
    `${execSync("brew --prefix graphite").toString().trim()}/bin/gp stacks`,
    {
      stdio: "inherit",
    }
  );
}

testDeploy();
