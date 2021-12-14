Contributing to Graphite CLI
--------------------------------

Test - 1 (to be removed) - 1
Test - 2 (to be removed)
Test - 3 (to be removed)
Test - 4 (to be removed)
Test - 5 (to be removed)
Test - 6 (to be removed)
Test - 7 (to be removed)
Test - 8 (to be removed)
Test - 9 (to be removed)
Test - 10 (to be removed)
Test - 11 (to be removed)
Test - 12 (to be removed)

Fun things. This will introduce merge conflicts
=======


Thank you for taking the time to make Graphite CLI better. These are mostly guidelines, not rules so use your best judgement and feel free to propose changes to this document in a PR.
We value contributions from anyone but we do not yet maintain an open queue of issues on Github. Our ideal contributors are our passionate users who have the most context around ongoing issues and features we are working on. 
Please join the growing community of Graphite users (see README) and interact with us directly using our Slack Community.

To install the latest version of our CLI: `brew install graphite`

## Pre-requisites
- Homebrew
- Yarn (`brew install yarn`)
- Node version manager (`brew install nvm` -- nvm would require you to add its directory to your PATH in your bash rc and make a directory. Make sure to follow the directions on-screen).

## Build/Test/Run

```shell
> git clone https://github.com/screenplaydev/graphite-cli.git
> cd graphite-cli
> cat .nvmrc # Outputs the node version used by graphite CLI
> node -v
> nvm use 
> yarn install # Installs the package deps
> cat package.json # File that contains all the scripts we use to build/test etc
> yarn build # Build the project
> yarn test-fast # Run the suite of tests on our project.

```

### Note
If you have graphite installed from brew, that installation will take precedence over your local build which means sometimes your local changes might not get picked up.
You may need to create an alias to the local installation found at `<graphite_cli_dir>/lib/node_modules/graphite-cli/dist/src/index.js`.


## Submitting PRs

Please provide clear context of your change and reasonable details around your solution for the team to do a quick and effective review. We try to be as quick as possible, however, clearly articulated PRs which tell a clear story will be given precedence.

1. Follow instructions to install, run and test the CLI locally.
2. Ensure that it passes the test-suite
3. Maintain code-style (We use `prettier`).
4. For commit-messages, we loosely follow the format recommended by [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
5. Please provide clear context of your change and reasonable details around your solution for the team to do a quick and effective review. We try to be as quick as possible, however, clearly articulated PRs which tell a clear story will be given precedence.

## Bug Reports and Feature Requests

We maintain a list of bug-reports and feature-requests on the [feature-board](https://app.graphite.dev/changes-requested) (requests auth).



Fun things. This will introduce merge conflicts. this is for testing
