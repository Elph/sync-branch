
require('jest');

const getCurrentPullRequest = require('../src/getCurrentPullRequest');

const repository = {
    owner: { login: 'elph' },
    name: 'repository-name'
};
const opt = {
    toBranch: 'staging',
    prBranchName: 'sync-staging-from-master'
};
let octokit = { rest: { pulls: {} } }

//describe divide our tests in sections
describe('getCurrentPullRequest', () => {

    afterAll(() => {
        // Restore
        jest.restoreAllMocks()
    })

    it('returns pullrequest when exist one', async () => {
        // Arrange
        octokit.rest.pulls.list = jest.fn((o) => {
            return {
                data: [
                    { head: { ref: 'sync-staging-from-master' }, base: { ref: 'staging' } },
                    { head: { ref: 'sync-staging-from-master2' }, base: { ref: 'staging2' } },
                ]
            };
        });

        // Act
        const pr = await getCurrentPullRequest(octokit, repository, opt);

        // Assert
        expect(pr).toBeTruthy();
        expect(octokit.rest.pulls.list)
            .toBeCalledWith({
                owner: 'elph',
                repo: 'repository-name'
            });
    });

    it('returns empty when doesn\'t exist one', async () => {
        // Arrange
        octokit.rest.pulls.list = jest.fn((o) => {
            return {
                data: [
                    { head: { ref: 'sync-staging-from-master2' }, base: { ref: 'staging2' } },
                ]
            };
        });

        // Act
        const pr = await getCurrentPullRequest(octokit, repository, opt);

        // Assert
        expect(pr).toBeFalsy();
        expect(octokit.rest.pulls.list)
            .toBeCalledWith({
                owner: 'elph',
                repo: 'repository-name'
            });
    });
});