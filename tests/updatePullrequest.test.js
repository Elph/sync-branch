
require('jest');

const updatePullrequest = require('../src/updatePullrequest');

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
describe('updatePullrequest', () => {

    afterAll(() => {
        // Restore
        jest.restoreAllMocks()
    })

    it('calls merge', async () => {
        // Arrange
        octokit.rest.repos.merge = jest.fn((o) => { return; });
        const pr = { number: '1234'};

        // Act
        await updatePullrequest(octokit, pr, repository, opt);

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