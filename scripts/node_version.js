/* eslint-disable */
const requiredVersion = '>=v14';
if (!require('semver').satisfies(process.version, requiredVersion)) {
  console.error(
    require('chalk').red(
      `Required Node.js version ${requiredVersion} not satisfied with current version ${process.version}.`
    )
  );
  process.exit(1);
}
