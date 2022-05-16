const parseOptions = require('./src/parseOptions.js');
const createPullRequest = require('./src/createPullRequest.js');
const updatePullRequest = require('./src/updatePullrequest.js');
const hasChanges = require('./src/hasChanges.js');
const getCurrentPullRequest = require('./src/getCurrentPullRequest.js');

module.exports = {
    parseOptions,
    createPullRequest,
    updatePullRequest,
    hasChanges,
    getCurrentPullRequest,
}