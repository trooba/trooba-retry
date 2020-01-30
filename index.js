'use strict';

const clone = require('klona');

module.exports = (pipe, config = {}) => {
    let maxRetries = config.retry || 0;
    const retryCodes = config.codes || [];
    const retryOperations = config.operations || [];
    const forceRetry = config.forceRetry || false;

    pipe.on('request', (request, next) => {
        // keep original request
        pipe.context.retry = {
            request
        };
        next(clone(request));
    });

    pipe.on('error', (err, next) => {
        if (shouldRetry(err)) {
            pipe.request(clone(pipe.context.retry.request));
            return;
        }
        next(err);
    });

    function shouldRetry(err) {
        return (forceRetry ||
            pipe.context.retry.request && pipe.context.retry.request.forceRetry ||
            retryOperations.indexOf(pipe.context.retry.request.operation) > -1 ||
            retryOperations.indexOf(pipe.context.operation) > -1 ||
            '*' in retryOperations) &&
            retryCodes.indexOf(err.code) > -1 &&
        maxRetries-- > 0;
    }
};
