async function hasChanges(octokit, repository, opt) {

    const comparison = await octokit.rest.repos.compareCommits({
        owner: repository.owner.login,
        repo: repository.name,
        base: opt.toBranch,
        head: opt.prBranchName
    });

    console.log(`There are ${comparison.data.files.length} files changes`)

    return comparison.data.files.length > 0;
}

module.exports = hasChanges;