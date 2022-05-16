
const core = require("@actions/core");
const github = require("@actions/github");

const parseOptions = require('./parseOptions.js');
const createPullRequest = require('./createPullRequest.js');
const updatePullRequest = require('./updatePullrequest.js');
const hasChanges = require('./hasChanges.js');
const getCurrentPullRequest = require('./getCurrentPullRequest.js');


async function run() {
    try {

        const opt = parseOptions();

        console.log(`Making a pull request to '${opt.toBranch}' from '${opt.fromBranch}' using branch '${opt.prBranchName}'.`);

        const {
            payload: { repository }
        } = github.context;

        const octokit = github.getOctokit(opt.githubToken);

        const hasChanged = await hasChanges(octokit, repository, opt);
        if (!hasChanged) {
            console.log(
                `There are no file changes between '${opt.toBranch}' and '${opt.prBranchName}', so we will just ignore this one`
            );

            return;
        }

        let currentPull = await getCurrentPullRequest(octokit, repository, opt);

        if (!currentPull) {

            currentPull = await createPullRequest(octokit, repository, opt);

        } else {

            await updatePullRequest(octokit, currentPull, repository, opt)

        }

        core.setOutput("PULL_REQUEST_URL", currentPull.url.toString());
        core.setOutput("PULL_REQUEST_NUMBER", currentPull.number.toString());

    } catch (error) {
        core.setFailed(error.message);
    }
}

module.exports = run;