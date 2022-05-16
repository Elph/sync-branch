const parseOptions = require('./parseOptions.js');
const createPullRequest = require('./createPullRequest.js');
const updatePullRequest = require('./updatePullrequest.js');
const hasChanges = require('./hasChanges.js');
const getCurrentPullRequest = require('./getCurrentPullRequest.js');

module.exports = {
    parseOptions,
    createPullRequest,
    updatePullRequest,
    hasChanges,
    getCurrentPullRequest,
}