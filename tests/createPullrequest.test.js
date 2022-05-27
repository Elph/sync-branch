
require('jest');

const createPullRequest = require('../src/createPullRequest');

const repository = {
    owner: { login: 'elph' },
    name: 'repository-name'
};
const opt = {
    toBranch: 'staging',
    fromBranch: 'master',
    prBranchName: 'sync-staging-from-master',
    reviewers: []
};
let octokit = { rest: { git: {}, pulls: {} } }

//describe divide our tests in sections
describe('createPullRequest', () => {

    afterAll(() => {
        // Restore
        jest.restoreAllMocks()
    })

    it('creates pullrequest', async () => {
        // Arrange
        octokit.rest.git.getRef = jest.fn((o) => { return { data: { object: { sha: '123456789' } } }; });
        octokit.rest.git.createRef = jest.fn();
        octokit.rest.pulls.create = jest.fn((o) => { return { data: { number: '1234' } }; });

        // Act
        const pr = await createPullRequest(octokit, repository, opt);

        // Assert
        expect(pr).toBeTruthy();
        expect(octokit.rest.git.getRef)
            .toBeCalledWith({
                owner: 'elph',
                repo: 'repository-name',
                ref: 'heads/master'
            });
        expect(octokit.rest.git.createRef)
            .toBeCalledWith({
                owner: 'elph',
                repo: 'repository-name',
                ref: 'refs/heads/sync-staging-from-master',
                sha: '123456789'
            });
        expect(octokit.rest.pulls.create)
            .toBeCalledWith({
                owner: 'elph',
                repo: 'repository-name',
                head: 'sync-staging-from-master',
                base: 'staging',
                title: `sync: master to staging`,
                body: `New code has just landed in \`master\`, so let's bring \`staging\` up to speed!`,
                draft: false
            });
    });

    it('creates pullrequest and assigns reviewers', async () => {
        // Arrange
        octokit.rest.git.getRef = jest.fn((o) => { return { data: { object: { sha: '123456789' } } }; });
        octokit.rest.git.createRef = jest.fn();
        octokit.rest.pulls.create = jest.fn((o) => { return { data: { number: '1234' } }; });
        octokit.request = jest.fn();
        opt.reviewers = ['elph']

        // Act
        const pr = await createPullRequest(octokit, repository, opt);

        // Assert
        expect(pr).toBeTruthy();
        expect(octokit.rest.git.getRef)
            .toBeCalledWith({
                owner: 'elph',
                repo: 'repository-name',
                ref: 'heads/master'
            });
        expect(octokit.rest.git.createRef)
            .toBeCalledWith({
                owner: 'elph',
                repo: 'repository-name',
                ref: 'refs/heads/sync-staging-from-master',
                sha: '123456789'
            });
        expect(octokit.rest.pulls.create)
            .toBeCalledWith({
                owner: 'elph',
                repo: 'repository-name',
                head: 'sync-staging-from-master',
                base: 'staging',
                title: `sync: master to staging`,
                body: `New code has just landed in \`master\`, so let's bring \`staging\` up to speed!`,
                draft: false
            });
        expect(octokit.request)
            .toBeCalledWith(
                'POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers', {
                owner: 'elph',
                repo: 'repository-name',
                pull_number: '1234',
                reviewers: ['elph']
            });
    });
});