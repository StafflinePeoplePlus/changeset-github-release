# Changeset Github Release

This is a CLI tool and primarily a GitHub Action to create GitHub releases automatically based on a
`CHANGELOG.md` file that is generated from changesets (or in theory another tool that outputs
similar enough markdown).

Note: This action currently only supports one package per repo as it does not add the name of the
package to the release or tag.

## Action

Assuming the CHANGELOG has already been generated, the following action will create a GitHub release
for the version in your package.json. It is safe to run this multiple times, if the release already
exists it will exit successfully.

```yaml
on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Create Release
        uses: StafflinePeoplePlus/changeset-github-release@01.0.0
```

This repo uses this action to create its releases so feel free to peek at
`.github/workflows/main.yml` for a full example in combo with the changesets action.

### Option

By default the action will automatically pick up the repo name & owner, and the package.json and
CHANGELOG.md files, but if theses are in non standard locations or for some reason you need to
change the repo the release happens on, then you can do so:

```
on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Create Release
        uses: StafflinePeoplePlus/changeset-github-release@1.0.0
        with:
          owner: my-username
          repo: my-cool-repo
          package-json: path/to/package.json
          changelog: path/to/CHANGELOG.md
```
