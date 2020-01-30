'use strict';

const Assert = require('assert');
const Trooba = require('trooba');
const retry = require('..');

describe(__filename, () => {
    it('should use default settings', done => {
        const client = Trooba
            .use(retry)
            .use(pipe => {
                pipe.on('request', request => {
                    pipe.respond('ok');
                });
            })
            .build()
            .create();

        client.request({
            foo: 'bar'
        }, (err, res) => {
            Assert.equal('ok', res);
            done();
        });
    });

    it('should not retry, retry is disabled by default', done => {
        let requestCount = 0;
        const client = Trooba
            .use(retry)
            .use(pipe => {
                pipe.on('request', () => {
                    requestCount++;
                    pipe.throw(new Error('BOOM'));
                });
            })
            .build()
            .create();

        client.request({
            foo: 'bar'
        }, (err, res) => {
            Assert.ok(err);
            Assert.equal('BOOM', err.message);
            Assert.equal(1, requestCount);
            done();
        });
    });

    it('should retry on timeout, operation in request', done => {
        let requestCount = 0;
        const client = Trooba
            .use(retry, {
                retry: 1,
                operations: ['one'],
                codes: ['ETIMEDOUT']
            })
            .use(pipe => {
                pipe.on('request', request => {
                    requestCount++;
                    if (requestCount > 1) {
                        return pipe.respond('ok');
                    }
                    pipe.throw(Object.assign(new Error('BOOM'), {
                        code: 'ETIMEDOUT'
                    }));
                });
            })
            .build()
            .create();

        client.request({
            foo: 'bar',
            operation: 'one'
        }, (err, res) => {
            Assert.equal('ok', res);
            Assert.equal(2, requestCount);
            done();
        });
    });

    it('should retry on timeout, operation in context', done => {
        let requestCount = 0;
        const client = Trooba
            .use(retry, {
                retry: 1,
                operations: ['one'],
                codes: ['ETIMEDOUT']
            })
            .use(pipe => {
                pipe.on('request', request => {
                    requestCount++;
                    if (requestCount > 1) {
                        return pipe.respond('ok');
                    }
                    pipe.throw(Object.assign(new Error('BOOM'), {
                        code: 'ETIMEDOUT'
                    }));
                });
            })
            .build()
            .create({
                operation: 'one'
            });

        client.request({
            foo: 'bar',
            operation: 'one'
        }, (err, res) => {
            Assert.equal('ok', res);
            Assert.equal(2, requestCount);
            done();
        });
    });

    it('should force retry on timeout, forceRetry in config', done => {
        let requestCount = 0;
        const client = Trooba
            .use(retry, {
                retry: 1,
                codes: ['ETIMEDOUT'],
                forceRetry: true
            })
            .use(pipe => {
                pipe.on('request', request => {
                    requestCount++;
                    if (requestCount > 1) {
                        return pipe.respond('ok');
                    }
                    pipe.throw(Object.assign(new Error('BOOM'), {
                        code: 'ETIMEDOUT'
                    }));
                });
            })
            .build()
            .create();

        client.request({
            foo: 'bar',
            operation: 'two'
        }, (err, res) => {
            Assert.equal('ok', res);
            Assert.equal(2, requestCount);
            done();
        });
    });

    it('should force retry on timeout, forceRetry in request', done => {
        let requestCount = 0;
        const client = Trooba
            .use(retry, {
                retry: 1,
                codes: ['ETIMEDOUT']
            })
            .use(pipe => {
                pipe.on('request', request => {
                    requestCount++;
                    if (requestCount > 1) {
                        return pipe.respond('ok');
                    }
                    pipe.throw(Object.assign(new Error('BOOM'), {
                        code: 'ETIMEDOUT'
                    }));
                });
            })
            .build()
            .create();

        client.request({
            foo: 'bar',
            operation: 'two',
            forceRetry: true
        }, (err, res) => {
            Assert.equal('ok', res);
            Assert.equal(2, requestCount);
            done();
        });
    });

    it('should not retry on other error', done => {
        let requestCount = 0;
        const client = Trooba
            .use(retry, {
                retry: 1,
                operations: ['one'],
                codes: ['SOMECODE']
            })
            .use(pipe => {
                pipe.on('request', request => {
                    requestCount++;
                    if (requestCount > 1) {
                        return pipe.respond('ok');
                    }
                    pipe.throw(new Error('BOOM'));
                });
            })
            .build()
            .create();

        client.request({
            foo: 'bar',
            operation: 'one'
        }, (err, res) => {
            Assert.ok(err);
            Assert.equal('BOOM', err.message);
            Assert.equal(1, requestCount);
            done();
        });
    });
});
