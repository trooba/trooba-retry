# trooba-retry

Generic retry handler for [trooba](https://github.com/trooba) framework.

[![Greenkeeper badge](https://badges.greenkeeper.io/trooba/trooba-retry.svg)](https://greenkeeper.io/)
[![codecov](https://codecov.io/gh/trooba/trooba-retry/branch/master/graph/badge.svg)](https://codecov.io/gh/trooba/trooba-retry)
[![Build Status](https://travis-ci.org/trooba/trooba-retry.svg?branch=master)](https://travis-ci.org/trooba/trooba-retry)
[![NPM](https://img.shields.io/npm/v/trooba-retry.svg)](https://www.npmjs.com/package/trooba-retry)
[![Downloads](https://img.shields.io/npm/dm/trooba-retry.svg)](http://npm-stat.com/charts.html?package=trooba-retry)
[![Known Vulnerabilities](https://snyk.io/test/github/trooba/trooba-retry/badge.svg)](https://snyk.io/test/github/trooba/trooba-retry)

## Install

```
npm install trooba-retry -S
```

## Usage

```js
const Trooba = require('trooba');

const pipe = Trooba
    .use(require('trooba-retry'), {
        retry: 1,            // number of retries for allowed operations
        operations: ['GET],  // compares against request.operation or context.operation
        codes: ['ETIMEDOUT'] // compares against err.code
    })
    .use(require('trooba-http-transport'), {
        hostname: 'localhost',
        port: 8000,
        connectTimeout: 1 // 1ms, use small to make it timeout
    })
    .build();

const client = pipe.create({
    operation: 'GET'
});

client.request({ foo: 'bar' }, (err, response) => {
    console.log(err, response); // should retry one time and then return error
});
```

## Configuration

* retry <number> specifies the number of retries in case of retriable error
* operations <array[string]> is a list of operation names that can be retries; it can be set via config
* codes <array[string|numbers]> is a list of error codes that can be retried provided that operation is also matched
* forceRetry will direct to always retry no matter of operation or codes, it can be set in the context or request
