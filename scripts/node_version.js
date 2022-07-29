/* eslint-disable */
const requiredVersion = '>=v14';
const semver = require('semver');
try {
 if (!semver.satisfies(process.version, requiredVersion)) {
    console.error(
      require('chalk').red(
        `Required Node.js version ${requiredVersion} not satisfied with current version ${process.version}.`
      )
    );
    process.exit(1);
  }
} catch {
  console.error(`Unable to validate Node.js version.  Note that Graphite requires v14 or higher.`)
}
