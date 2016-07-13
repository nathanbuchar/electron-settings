/* global it, describe, before, after, beforeEach, afterEach */

'use strict';

const fs = require('fs-extra');
const helpers = require('key-path-helpers');
const path = require('path');
const tmp = require('tmp');

const ElectronSettings = require('../');

let tmpDir = path.resolve('test', '.tmp');

fs.ensureDirSync(tmpDir);

let tmpFileName = tmp.tmpNameSync({
  prefix: 'tmp-',
  dir: '.'
});

let tmpSettings = new ElectronSettings({
  dir: tmpDir
  // file: 'test'
});

describe('', () => {
  it('', done => {
    tmpSettings.watch('foo.bar');
    done();
  });
});
