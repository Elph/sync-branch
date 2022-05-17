
require('jest');
const core = require("@actions/core");

const parseOptions = require('../src/parseOptions.js');

let inputs = {};

//describe divide our tests in sections
describe('parseOptions', () => {
    beforeAll(() => {
        // Mock getInput
        jest.spyOn(core, 'getInput').mockImplementation((name) => {
            return inputs[name]
        });

        // Mock error/warning/info/debug
        jest.spyOn(core, 'error').mockImplementation(jest.fn())
        jest.spyOn(core, 'warning').mockImplementation(jest.fn())
        jest.spyOn(core, 'info').mockImplementation(jest.fn())
        jest.spyOn(core, 'debug').mockImplementation(jest.fn())
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
        inputs.FROM_BRANCH = 'master';
        inputs.TO_BRANCH = 'staging';
        inputs.GITHUB_TOKEN = 'TOKEN';
        inputs.REVIEWERS = "me,you";

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

