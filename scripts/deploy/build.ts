#! /usr/bin/env ts-node
import { execSync } from "child_process";
export function build(): void {
  console.log("building...");
  execSync(`rm -rf ./dist`), { stdio: "inherit" };
  execSync(`yarn install --immutable`, { stdio: "ignore" });
  execSync(`yarn build`, { stdio: "ignore" });
  execSync(`rm -rf ./node_modules`), { stdio: "ignore" };
  console.log("done building");
}
