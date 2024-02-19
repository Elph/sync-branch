
require('jest');

const updatePullRequest = require('../src/updatePullRequest');

const repository = {
    owner: { login: 'elph' },
    name: 'repository-name'
};
const opt = {
    toBranch: 'staging',
    fromBranch: 'master',
    prBranchName: 'sync-staging-from-master'
};
let octokit = { rest: { repos: {} } }

//describe divide our tests in sections
describe('updatePullRequest', () => {

    afterAll(() => {
        // Restore
        jest.restoreAllMocks()
    })

    it('calls merge', async () => {
        // Arrange
        octokit.rest.repos.merge = jest.fn(() => { return; });
        const pr = { number: '1234'};

        // Act
        await updatePullRequest(octokit, pr, repository, opt);

        // Assert
        expect(octokit.rest.repos.merge)
            .toBeCalledWith({
                owner: 'elph',
                repo: 'repository-name',
                base: 'sync-staging-from-master',
                head: 'master'
            });
    });
});