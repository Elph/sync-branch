
const core = require("@actions/core");

function parseOptions() {
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

module.exports = parseOptions;