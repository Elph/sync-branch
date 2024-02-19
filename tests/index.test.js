const core = require("@actions/core");
const github = require("@actions/github");
const run = require('../src/index');
jest.mock('../src/parseOptions');
jest.mock('../src/createPullRequest');
jest.mock('../src/updatePullRequest');
jest.mock('../src/hasChanges');
jest.mock('../src/getCurrentPullRequest');

// Mocked data for tests
const mockContext = {
    payload: {
        repository: {
            owner: {
                login: 'elph',
            },
            name: 'repository-name',
        },
    },
};
const mockOpt = {
    toBranch: 'staging',
    fromBranch: 'master',
    prBranchName: 'sync-staging-from-master',
    githubToken: 'token',
    reviewers: ['elph'],
};

describe('run function behavior', () => {
    beforeAll(() => {
        // Mock core functions
        jest.spyOn(core, 'setOutput').mockImplementation();
        jest.spyOn(core, 'setFailed').mockImplementation();

        // Setup GitHub context
        github.context = mockContext;

        // Mock other imported functions
        const parseOptions = require('../src/parseOptions');
        parseOptions.mockImplementation(() => mockOpt);

        const hasChanges = require('../src/hasChanges');
        hasChanges.mockResolvedValue(true);

        const getCurrentPullRequest = require('../src/getCurrentPullRequest');
        getCurrentPullRequest.mockResolvedValue(null);

        const createPullRequest = require('../src/createPullRequest');
        createPullRequest.mockResolvedValue({
            url: 'http://example.com/pull/1',
            number: 1,
        });

        const updatePullRequest = require('../src/updatePullRequest');
        updatePullRequest.mockResolvedValue();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should do nothing when no changes', async () => {
        // Arrange
        const hasChanges = require('../src/hasChanges');
        hasChanges.mockResolvedValueOnce(false);

        // Act
        await run();

        // Assert
        expect(core.setOutput).not.toHaveBeenCalled();
        expect(core.setFailed).not.toHaveBeenCalled();
    });

    it('should create pull request when it does not exist', async () => {
        // Arrange
        const getCurrentPullRequest = require('../src/getCurrentPullRequest');
        getCurrentPullRequest.mockResolvedValueOnce(null); // Simulate no existing PR

        // Act
        await run();

        // Assert
        const createPullRequest = require('../src/createPullRequest');
        expect(createPullRequest).toHaveBeenCalled();
        expect(core.setOutput).toHaveBeenCalledWith("PULL_REQUEST_URL", expect.any(String));
        expect(core.setOutput).toHaveBeenCalledWith("PULL_REQUEST_NUMBER", expect.any(String));
    });

    it('should update pull request when it exists', async () => {
        // Arrange
        const getCurrentPullRequest = require('../src/getCurrentPullRequest');
        getCurrentPullRequest.mockResolvedValueOnce({ // Simulate existing PR
            url: 'http://example.com/pull/2',
            number: 2,
        });

        // Act
        await run();

        // Assert
        const updatePullRequest = require('../src/updatePullRequest');
        expect(updatePullRequest).toHaveBeenCalled();
        expect(core.setOutput).toHaveBeenCalledWith("PULL_REQUEST_URL", expect.any(String));
        expect(core.setOutput).toHaveBeenCalledWith("PULL_REQUEST_NUMBER", expect.any(String));
    });
});