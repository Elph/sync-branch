
require('jest');
const core = require("@actions/core");
const github = require("@actions/github");

const run = require('../src/index');

const parseOptions = require('../src/parseOptions.js');
const createPullRequest = require('../src/createPullRequest.js');
const updatePullRequest = require('../src/updatePullrequest.js');
const hasChanges = require('../src/hasChanges.js');
const getCurrentPullRequest = require('../src/getCurrentPullRequest.js');

// const repository = {
//     owner: { login: 'elph' },
//     name: 'repository-name'
// };
// const opt = {
//     toBranch: 'staging',
//     fromBranch: 'master',
//     prBranchName: 'sync-staging-from-master',
//     reviewers: []
// };
// let octokit = { rest: { git: {}, pulls: {} } }

//describe divide our tests in sections
describe('run', () => {
    beforeAll(() => {
        // Mock getInput
        jest.spyOn(core, 'setOutput');
        jest.spyOn(core, 'setFailed');
        github.context = { repository: {} };
        //jest.spyOn(github, 'context').mockImplementation((name) => inputs[name]);
        jest.mock('../src/parseOptions.js', () => {
            return {
                toBranch: 'staging',
                fromBranch: 'master',
                prBranchName: 'sync-staging-from-master',
                reviewers: ['elph']
            };
        });
    });

    beforeEach(() => {
        // Reset inputs

    });

    afterAll(() => {

        // Restore
        jest.restoreAllMocks()
    })

    it('should do nothing when no changes', async () => {
        // Arrange
        // octokit.rest.git.getRef = jest.fn((o) => { return { data: { object: { sha: '123456789' } } }; });
        // octokit.rest.git.createRef = jest.fn();
        // octokit.rest.pulls.create = jest.fn((o) => { return { data: { number: '1234' } }; });

        // Act
        run();

        // Assert
        // expect(pr).toBeTruthy();
        // expect(octokit.rest.git.getRef)
        //     .toBeCalledWith({
        //         owner: 'elph',
        //         repo: 'repository-name',
        //         ref: 'heads/master'
        //     });
        // expect(octokit.rest.git.createRef)
        //     .toBeCalledWith({
        //         owner: 'elph',
        //         repo: 'repository-name',
        //         ref: 'refs/heads/sync-staging-from-master',
        //         sha: '123456789'
        //     });
        // expect(octokit.rest.pulls.create)
        //     .toBeCalledWith({
        //         owner: 'elph',
        //         repo: 'repository-name',
        //         head: 'sync-staging-from-master',
        //         base: 'staging',
        //         title: `sync: master to staging`,
        //         body: `New code has just landed in \`master\`, so let's bring \`staging\` up to speed!`,
        //         draft: false
        //     });
    });

    it('should update pullrequest when exists', async () => {
        // Arrange

        // Act

        // Assert
    });

    it('should create pullrequest when doesn\'t exists', async () => {
        // Arrange

        // Act

        // Assert
    });
});