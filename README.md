# Sync Branch Action

Github action that will create pull request when a defined branch has changed. It will use an intermediate branch
If multiple changes on the sourc branch happens it will update the intermediate branch

## Usage

You can now consume the action by referencing the v1 branch

```yaml
uses: Elph/sync-branch@v1
with:
  GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
  FROM_BRANCH: "master"
  TO_BRANCH: "develop"
  REVIEWERS: "user1,user2"
```

See the [actions tab](https://github.com/Elph/sync-branch/actions) for runs of this action! :rocket:

## Frequently Asked Questions

### Why aren't pull requests created by this action triggering associated GitHub Actions?

This issue arises when the default `GITHUB_TOKEN` from the environment is used. GitHub deliberately made this design decision to prevent the possibility of infinite loops when using GitHub Actions. You can find more details about this in GitHub's [documentation on triggering workflows](https://docs.github.com/en/actions/using-workflows/triggering-a-workflow#triggering-a-workflow-from-a-workflow).
