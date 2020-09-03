const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const fromBranch = core.getInput("FROM_BRANCH", { required: true });
    const toBranch = core.getInput("TO_BRANCH", { required: true });
    const githubToken = core.getInput("GITHUB_TOKEN", { required: true });
    const prSuffix = core.getInput("PR_SUFFIX") || '-sync';

    const prTitle = `sync: ${fromBranch} to ${toBranch}`;
    const prBody = `New code has just landed in \`${fromBranch}\`, so let's bring \`${toBranch}\` up to speed!`;
    const prBranchName = `${fromBranch}${prSuffix}`;

    console.log(`Making a pull request to '${toBranch}' from '${fromBranch}' using branch '${prBranchName}'.`);

    const {
      payload: { repository }
    } = github.context;

    const octokit = new github.GitHub(githubToken);

    const { data: currentPulls } = await octokit.pulls.list({
      owner: repository.owner.name,
      repo: repository.name
    });

    const currentPull = currentPulls.find(pull => {
      return pull.head.ref === prBranchName && pull.base.ref === toBranch;
    });

    if (!currentPull) {

      const { data: fromRef } = await octokit.git.getRef({
        owner: repository.owner.login,
        repo: repository.name,
        ref: `heads/${fromBranch}`,
      });

      await octokit.git.createRef({
        owner: repository.owner.login,
        repo: repository.name,
        ref: `refs/heads/${prBranchName}`,
        sha: fromRef.object.sha
      });

      const { data: pullRequest } = await octokit.pulls.create({
        owner: repository.owner.login,
        repo: repository.name,
        head: prBranchName,
        base: toBranch,
        title: prTitle,
        body: prBody,
        draft: false
      });

      console.log(
        `Pull request (${pullRequest.number}) successful! You can view it here: ${pullRequest.url}.`
      );

      core.setOutput("PULL_REQUEST_URL", pullRequest.url.toString());
      core.setOutput("PULL_REQUEST_NUMBER", pullRequest.number.toString());
    
    } else {

      console.log(
        `Updating existing pull request (${currentPull.number}) to '${toBranch}' from '${prBranchName}'.`,
        `Merging last version from '${toBranch}' into intermediate '${prBranchName}'`,
        `You can view it here: ${currentPull.url}`
      );

      await octokit.repos.merge({
        owner: repository.owner.login,
        repo: repository.name,
        base: prBranchName,
        head: fromBranch,
      });

      core.setOutput("PULL_REQUEST_URL", currentPull.url.toString());
      core.setOutput("PULL_REQUEST_NUMBER", currentPull.number.toString());
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
