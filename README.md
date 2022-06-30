## What is Graphite?

[Graphite](https://graphite.dev) is a **fast, simple code review platform** designed for engineers who want to **write and review smaller pull requests, stay unblocked, and ship faster**.  Anyone can start using Graphite individually without needing their coworkers to change tools - we'll seamlessly sync your code changes and reviews.  We built Graphite because we missed internal code review tools like Phabricator (at Facebook) and Critique (Google) that help engineers create, approve, and ship small, incremental changes, and long-term we’re passionate about creating products & workflows that help fast-moving eng teams achieve more.

Graphite is designed to be used at work - unfortunately we don't yet support submitting PRs to open-source repos as an external contributor (i.e. without write access) due to limitations of GitHub.

## Graphite beta
Graphite is currently in closed beta, and you’ll need a Graphite account to submit pull requests with the CLI.  You can [sign up for the waitlist](https://graphite.dev) for early access - we'll let you skip the line if someone on your team already uses Graphite!

## User guide

<https://docs.graphite.dev/>

Everything is still a little early, so please add comments to our user guide if you have any questions, feedback, or suggestions!


## Developing and Running tests

Interested in contributing to graphite CLI? Here's how to get started.

You'll need to install yarn on your machine
```
npm install --global yarn
```

Build the CLI
```
nvm use
yarn install
yarn build
```

Running tests
```
DEBUG=1 yarn test --full-trace
```

Running a subset of tests
```
DEBUG=1 yarn test --full-trace -g "test pattern"
```

Running one test
```
DEBUG=1 yarn test-one "<path to .js test file in dist folder>"
```

Running the CLI locally (after build)
```
yarn cli <command> (to run `gt <command>`)
```

Linking `gt` to a locally built version (includes a build)
```
yarn develop
# then, 
gt <command>
```

By contributing to the Graphite CLI, you agree to the terms of the Graphite Individual Contributor License Agreement as defined in CLA.md
