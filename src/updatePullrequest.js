async function updatePullRequest(octokit, pullRequest, repository, opt) {

    console.log(
        `Updating existing pull request (${pullRequest.number}) to '${opt.toBranch}' from '${opt.prBranchName}'.`,
        `Merging last version from '${opt.toBranch}' into intermediate '${opt.prBranchName}'`,
        `You can view it here: ${pullRequest.url}`
    );

    await octokit.rest.repos.merge({
        owner: repository.owner.login,
        repo: repository.name,
        base: opt.prBranchName,
        head: opt.fromBranch,
    });
}

module.exports = updatePullRequest;