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

async function createPullRequest(octokit, repository, opt) {

  const prTitle = `sync: ${opt.fromBranch} to ${opt.toBranch}`;
  const prBody = `New code has just landed in \`${opt.fromBranch}\`, so let's bring \`${opt.toBranch}\` up to speed!`;
 
  const { data: fromRef } = await octokit.rest.git.getRef({
    owner: repository.owner.login,
    repo: repository.name,
    ref: `heads/${opt.fromBranch}`,
  });

  await octokit.rest.git.createRef({
    owner: repository.owner.login,
    repo: repository.name,
    ref: `refs/heads/${opt.prBranchName}`,
    sha: fromRef.object.sha
  });

  const { data: pullRequest } = await octokit.rest.pulls.create({
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

  return pullRequest;
}

async function updatePullRequest(octokit, currentPull, repository, opt) {
  
  console.log(
    `Updating existing pull request (${currentPull.number}) to '${opt.toBranch}' from '${opt.prBranchName}'.`,
    `Merging last version from '${opt.toBranch}' into intermediate '${opt.prBranchName}'`,
    `You can view it here: ${currentPull.url}`
  );
  
  await octokit.rest.repos.merge({
    owner: repository.owner.login,
    repo: repository.name,
    base: opt.prBranchName,
    head: opt.fromBranch,
  });
}

async function hasChanges(octokit, repository, opt) {
  
  const comparison = await octokit.rest.repos.compareCommits({
    owner: repository.owner.login,
    repo: repository.name,
    base: opt.toBranch,
    head:  opt.prBranchName
  });
  
  console.log(comparison);

  return comparison.files.length === 0;
}

async function getCurrentPullRequest(octokit, repository, opt){
  const { data: currentPulls } = await octokit.rest.pulls.list({
    owner: repository.owner.name,
    repo: repository.name
  });

  const currentPull = currentPulls.find(pull => {
    return pull.head.ref === opt.prBranchName && pull.base.ref === opt.toBranch;
  });

  return currentPull;
}

async function run() {
  try {

    const opt = parseOptions();
    
    console.log(`Making a pull request to '${opt.toBranch}' from '${opt.fromBranch}' using branch '${opt.prBranchName}'.`);

    const {
      payload: { repository }
    } = github.context;

    const octokit = github.getOctokit(opt.githubToken);
    
    const hasChanged = await hasChanges(octokit, repository, opt);
    if(!hasChanged){
      console.log(
        `There are no file changes between '${opt.toBranch}' and '${opt.prBranchName}', so we will just ignore this one`
      );

      return;
    }
    
    let currentPull = await getCurrentPullRequest(octokit, repository, opt);

    if (!currentPull) {

      currentPull = await createPullRequest();

    } else {

      await updatePullRequest()
      
    }

    core.setOutput("PULL_REQUEST_URL", currentPull.url.toString());
    core.setOutput("PULL_REQUEST_NUMBER", currentPull.number.toString());

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
