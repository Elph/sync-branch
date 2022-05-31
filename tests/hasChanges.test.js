
require('jest');

const hasChanges = require('../src/hasChanges');

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
describe('hasChanges', () => {

    afterAll(() => {
        // Restore
        jest.restoreAllMocks()
    })

    it('returns true when comparison has file changes', async () => {
        // Arrange
        octokit.rest.repos.compareCommits = jest.fn(() => {
            return { data: { files: [{}, {}] } };
        });

        // Act
        const changes = await hasChanges(octokit, repository, opt);

        // Assert
        expect(changes).toBe(true);
        expect(octokit.rest.repos.compareCommits)
            .toBeCalledWith({
                owner: 'elph',
                repo: 'repository-name',
                base: 'staging',
                head: 'master'
            });
    });

    it('returns false when comparison has file changes', async () => {
        // Arrange
        octokit.rest.repos.compareCommits = jest.fn(() => {
            return { data: { files: [] } };
        });

        // Act
        const changes = await hasChanges(octokit, repository, opt);

        // Assert
        expect(changes).toBe(false);
        expect(octokit.rest.repos.compareCommits)
            .toBeCalledWith({
                owner: 'elph',
                repo: 'repository-name',
                base: 'staging',
                head: 'master'
            });
    });
});