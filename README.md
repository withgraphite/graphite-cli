## What is Graphite?

Graphite is an [open source CLI](https://github.com/screenplaydev/graphite-cli/) + a [code review dashboard on top of GitHub](https://app.graphite.dev) that makes **creating & reviewing stacked changes fast & intuitive.**  Anyone can start using Graphite individually without needing their coworkers to change tools - we'll seamlessly sync your code changes and reviews.  We built Graphite because we missed tools like Phabricator (at Facebook) and Critique (Google) that help engineers create and ship small, incremental changes, and long-term we’re passionate about creating a powerful, modern code review experience (think Linear for CR) for fast-moving eng teams.

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
yarn install
yarn build
```

Running tests
```
DEBUG=1 yarn test --full-trace
```

Running fast suite of test
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