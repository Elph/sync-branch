
async function getCurrentPullRequest(octokit, repository, opt) {

    const { data: pullRequests } = await octokit.rest.pulls.list({
        owner: repository.owner.login,
        repo: repository.name
    });

    const pullRequest = pullRequests.find(pr => {
        return pr.head.ref === opt.prBranchName && pr.base.ref === opt.toBranch;
    });

    return pullRequest;
}

module.exports = getCurrentPullRequest;