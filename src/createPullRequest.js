

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

  module.exports = createPullRequest;