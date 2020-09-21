const core = require("@actions/core");
const github = require("@actions/github");

function parseOptions(){
  const fromBranch = core.getInput("FROM_BRANCH", { required: true });
    const toBranch = core.getInput("TO_BRANCH", { required: true });
    const githubToken = core.getInput("GITHUB_TOKEN", { required: true });
    const reviewersStr = core.getInput("REVIEWERS", { required: false });
    return {
      fromBranch: fromBranch,
      toBranch: toBranch,
      reviewers: reviewersStr ? reviewersStr.split(',').map((item) => item.trim()) : [],
      githubToken: githubToken,
      prBranchName: `sync-${toBranch}-from-${fromBranch}`
    }
}

async function run() {
  try {

    const opt = parseOptions();

    const prTitle = `sync: ${opt.fromBranch} to ${opt.toBranch}`;
    const prBody = `New code has just landed in \`${opt.fromBranch}\`, so let's bring \`${opt.toBranch}\` up to speed!`;
    
    console.log(`Making a pull request to '${opt.toBranch}' from '${opt.fromBranch}' using branch '${opt.prBranchName}'.`);

    const {
      payload: { repository }
    } = github.context;

    const octokit = new github.GitHub(opt.githubToken);

    const { data: currentPulls } = await octokit.pulls.list({
      owner: repository.owner.name,
      repo: repository.name
    });

    const currentPull = currentPulls.find(pull => {
      return pull.head.ref === opt.prBranchName && pull.base.ref === opt.toBranch;
    });

    if (!currentPull) {

      const { data: fromRef } = await octokit.git.getRef({
        owner: repository.owner.login,
        repo: repository.name,
        ref: `heads/${opt.fromBranch}`,
      });

      await octokit.git.createRef({
        owner: repository.owner.login,
        repo: repository.name,
        ref: `refs/heads/${opt.prBranchName}`,
        sha: fromRef.object.sha
      });

      const { data: pullRequest } = await octokit.pulls.create({
        owner: repository.owner.login,
        repo: repository.name,
        head: opt.prBranchName,
        base: opt.toBranch,
        title: prTitle,
        body: prBody,
        draft: false
      });

      console.log(
        `Pull request (${pullRequest.number}) successful! You can view it here: ${pullRequest.url}.`
      );

      if(opt.reviewers.length > 0) {

        // the call in octokit rest requestReviewers seems not to exist, so its calling directly the method
        await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers', {
          owner: repository.owner.login,
          repo: repository.name,
          pull_number: pullRequest.number,
          reviewers: opt.reviewers
        });

      }

      core.setOutput("PULL_REQUEST_URL", pullRequest.url.toString());
      core.setOutput("PULL_REQUEST_NUMBER", pullRequest.number.toString());
    
    } else {

      console.log(
        `Updating existing pull request (${currentPull.number}) to '${opt.toBranch}' from '${opt.prBranchName}'.`,
        `Merging last version from '${opt.toBranch}' into intermediate '${opt.prBranchName}'`,
        `You can view it here: ${currentPull.url}`
      );

      await octokit.repos.merge({
        owner: repository.owner.login,
        repo: repository.name,
        base: opt.prBranchName,
        head: opt.fromBranch,
      });

      core.setOutput("PULL_REQUEST_URL", currentPull.url.toString());
      core.setOutput("PULL_REQUEST_NUMBER", currentPull.number.toString());
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
