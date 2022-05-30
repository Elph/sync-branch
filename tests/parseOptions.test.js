
require('jest');
const core = require("@actions/core");

const parseOptions = require('../src/parseOptions.js');

let inputs = {};

//describe divide our tests in sections
describe('parseOptions', () => {
    beforeAll(() => {
        // Mock getInput
        jest.spyOn(core, 'getInput').mockImplementation((name) => inputs[name]);
    });

    beforeEach(() => {
        // Reset inputs
        inputs = {}
    });

    afterAll(() => {
        // Restore
        jest.restoreAllMocks()
    })

    it('returns correct inputs', async () => {
        // Arrange
        inputs = {
            FROM_BRANCH: 'master',
            TO_BRANCH: 'staging',
            GITHUB_TOKEN: 'TOKEN',
            REVIEWERS: "me,you",
        };

        // Act
        const options = parseOptions();

        // Assert
        expect(options.githubToken).toBe('TOKEN');
        expect(options.fromBranch).toBe('master');
        expect(options.toBranch).toBe('staging');
        expect(options.reviewers).toStrictEqual(['me', 'you']);
        expect(options.prBranchName).toBe('sync-staging-from-master');
    });
});