/**
 * @fileoverview Mocha test specs.
 * @author Nathan Buchar
 */

/* global it, describe, before, after, beforeEach, afterEach */

'use strict';

let _ = require('lodash');
let chai = require('chai');
let fs = require('fs-extra');
let path = require('path');
let tmp = require('tmp');

/**
 * Import ElectronSettings
 */
let ElectronSettings = require('../');

/**
 * Import key path helpers.
 */
let keyPathHelpers = require('../lib/key-path-helpers');

/**
 * Chai assertion shorthands.
 */
let expect = chai.expect;
let should = chai.should();

/**
 * Declare tmp variables.
 */
let settings;
let tmpFileName;

/**
 * @const {string} The absolute path to the tmp directory for sandbox testing.
 */
const PATH_TO_TMP = path.join(__dirname, '.tmp');

/**
 * Reads the settings file.
 *
 * @returns {Object}
 */
function readSettingsSync() {
  return fs.readJsonSync(settings.getConfigFilePath());
}

/**
 * Alias for keyPathHelpers.getValueAtKeyPath
 *
 * @returns {mixed}
 */
function getValueAtKeyPath(obj, keyPath) {
  return keyPathHelpers.getValueAtKeyPath(obj, keyPath);
}

/**
 * Creates the `tmp` temporary directory sandbox for testing.
 */
before('create tmp directory', function () {
  fs.ensureDirSync(PATH_TO_TMP);
});

/**
 * Generates a temporary settings file.
 */
beforeEach('generate temporary file', function () {
  tmpFileName = tmp.tmpNameSync({
    prefix: 'tmp-',
    dir: '.'
  });
});

/**
 * Create the ElectronSettings instance to test with.
 */
beforeEach('create ElectronSettings instance', function () {
  settings = new ElectronSettings({
    configDirPath: PATH_TO_TMP,
    configFileName: tmpFileName
  });
});

/**
 * Wait for the ElectronSettings instance to become ready.
 */
beforeEach('wait for ready', function (done) {
  settings.on('ready', () => {
    done();
  });
});

/**
 * Delete the temporary config file.
 */
afterEach('destroy ElectronSettings instance', function () {
  fs.removeSync(settings.getConfigFilePath());
});

/**
 * Destroy the ElectronSettings instance.
 */
afterEach('destroy ElectronSettings instance', function () {
  settings.destroy();
  settings = null;
});

/**
 * Removes the `tmp` temporary directory sandbox we used for testing.
 */
after('remove tmp directory', function () {
  fs.removeSync(PATH_TO_TMP);
});

describe('set()', function () {

  it('should set a value at a given key path', function () {
    let keyPath = 'foo';
    let value = 'bar';

    settings.set(keyPath, value);

    expect(getValueAtKeyPath(settings.cache, keyPath))
      .to.equal(value);
  });

  it('should set a value at root', function () {
    let keyPath = '.';
    let value = { foo: 'bar' };

    settings.set(keyPath, value);

    expect(getValueAtKeyPath(settings.cache, 'foo'))
      .to.equal(value.foo);
  });
});

describe('get()', function () {

  it('should return the value at a given key path', function () {
    let keyPath = 'foo';
    let value = 'bar';

    settings.set(keyPath, value);

    expect(getValueAtKeyPath(settings.cache, keyPath))
      .to.equal(settings.get(keyPath));
  });

  it('should return the value at root', function () {
    let keyPath = '.';
    let value = { foo: 'bar' };

    settings.set(keyPath, value);

    expect(getValueAtKeyPath(settings.cache, 'foo'))
      .to.equal(settings.get(keyPath).foo);
  });
});

describe('unset()', function () {

  beforeEach(function () {
    settings.set('foo.bar', 'baz');
  });

  it('should unset the given key path', function () {
    let keyPath = 'foo.bar';

    settings.unset(keyPath);

    should.not.exist(settings.get(keyPath));
  });

  it('should empty at root', function () {
    let keyPath = '.';

    settings.unset(keyPath);

    expect(settings.get(keyPath)).to.be.an('object');
    should.not.exist(settings.get('foo.bar'));
  });
});

describe('empty()', function () {

  beforeEach(function () {
    settings.set('foo.bar', 'baz');
  });

  it('should empty the settings cache', function () {
    settings.empty();

    expect(settings.get()).to.be.an('object');
    should.not.exist(settings.get('foo.bar'));
  });

  it('should empty at root', function () {
    let keyPath = '.';

    settings.unset(keyPath);

    expect(settings.get(keyPath)).to.be.an('object');
    should.not.exist(settings.get('foo.bar'));
  });
});

describe('getConfigFilePath()', function () {

  it('should return the correct path', function () {
    let filePath = settings.getConfigFilePath();

    expect(filePath).to.equal(
      path.join(PATH_TO_TMP, tmpFileName + '.json'));
  });
});

describe('watch', function () {

  it('should handle NEW values', function (done) {
    let keyPath = 'foo';
    let value = 'bar';

    settings.watch(keyPath, data => {
      should.exist(data);
      expect(data.action).to.equal(ElectronSettings.ChangeActions.NEW);
      expect(data.keyPath).to.equal(keyPath);
      expect(data.now).to.equal(value);
      done();
    });

    settings.set(keyPath, value);
  });

  it('should handle EDITED values', function (done) {
    let keyPath = 'foo';
    let values = {
      before: 'bar',
      after: 'baz'
    };

    settings.set(keyPath, values.before);

    settings.watch(keyPath, data => {
      should.exist(data);
      expect(data.action).to.equal(ElectronSettings.ChangeActions.EDITED);
      expect(data.keyPath).to.equal(keyPath);
      expect(data.was).to.equal(values.before);
      expect(data.now).to.equal(values.after);
      done();
    });

    settings.set(keyPath, values.after);
  });

  it('should handle DELETED values', function (done) {
    let keyPath = 'foo';
    let value = 'bar';

    settings.set(keyPath, value);

    settings.watch(keyPath, data => {
      should.exist(data);
      expect(data.action).to.equal(ElectronSettings.ChangeActions.DELETED);
      expect(data.keyPath).to.equal(keyPath);
      expect(data.was).to.equal(value);
      done();
    });

    settings.unset(keyPath);
  });

  it('should handle NEW ARRAY values', function (done) {
    let keyPath = 'foo';
    let values = {
      before: [0, 1, 2],
      after: [0, 1, 2, 4]
    };

    settings.set(keyPath, values.before);

    settings.watch(keyPath, data => {
      should.exist(data);
      expect(data.action).to.equal(ElectronSettings.ChangeActions.ARRAY);
      expect(data.keyPath).to.equal(keyPath);
      expect(data.items).to.have.length(1);

      expect(data.items[0].action).to.equal(ElectronSettings.ChangeActions.NEW);
      expect(data.items[0].index).to.equal(3);
      expect(data.items[0].now).to.equal(values.after[data.items[0].index]);
      done();
    });

    settings.set(keyPath, values.after);
  });

  it('should handle EDITED ARRAY values', function (done) {
    let keyPath = 'foo';
    let values = {
      before: [0, 1, 2],
      after: [0, 1, 3]
    };

    settings.set(keyPath, values.before);

    settings.watch(keyPath, data => {
      should.exist(data);
      expect(data.action).to.equal(ElectronSettings.ChangeActions.ARRAY);
      expect(data.keyPath).to.equal(keyPath);
      expect(data.items).to.have.length(1);

      expect(data.items[0].action).to.equal(ElectronSettings.ChangeActions.EDITED);
      expect(data.items[0].index).to.equal(2);
      expect(data.items[0].now).to.equal(values.after[data.items[0].index]);
      done();
    });

    settings.set(keyPath, values.after);
  });

  it('should handle DELETED ARRAY values', function (done) {
    let keyPath = 'foo';
    let values = {
      before: [0, 1, 2],
      after: [0, 1]
    };

    settings.set(keyPath, values.before);

    settings.watch(keyPath, data => {
      should.exist(data);
      expect(data.action).to.equal(ElectronSettings.ChangeActions.ARRAY);
      expect(data.keyPath).to.equal(keyPath);
      expect(data.items).to.have.length(1);

      expect(data.items[0].action).to.equal(ElectronSettings.ChangeActions.DELETED);
      expect(data.items[0].index).to.equal(2);
      expect(data.items[0].was).to.equal(values.before[data.items[0].index]);
      done();
    });

    settings.set(keyPath, values.after);
  });

  it('should handle mixed ARRAY values', function (done) {
    let keyPath = 'foo';
    let values = {
      before: [0, 1, 2],
      after: [0, 1, 3, 4]
    };

    settings.set(keyPath, values.before);

    settings.watch(keyPath, data => {
      should.exist(data);
      expect(data.action).to.equal(ElectronSettings.ChangeActions.ARRAY);
      expect(data.keyPath).to.equal(keyPath);
      expect(data.items).to.have.length(2);

      expect(data.items[0].action).to.equal(ElectronSettings.ChangeActions.EDITED);
      expect(data.items[0].index).to.equal(2);
      expect(data.items[0].now).to.equal(values.after[data.items[0].index]);

      expect(data.items[1].action).to.equal(ElectronSettings.ChangeActions.NEW);
      expect(data.items[1].index).to.equal(3);
      expect(data.items[1].now).to.equal(values.after[data.items[1].index]);

      done();
    });

    settings.set(keyPath, values.after);
  });

  it('should use minimatch to match keys', function (done) {
    let keyPath = 'foo';
    let value = 'bar';

    settings.watch('*', data => {
      should.exist(data);
      done();
    });

    settings.set(keyPath, value);
  });
});

describe('unwatch', function () {

  it('should unwatch a chosen key path', function (done) {
    let keyPath = 'foo';
    let value = 'bar';

    settings.watch(keyPath, data => {
      should.not.exist(data);
    });

    expect(settings.watchList.has(keyPath)).to.equal(true);

    settings.unwatch(keyPath);

    expect(settings.watchList.has(keyPath)).to.not.equal(true);

    settings.set(keyPath, value);

    setTimeout(done, 250);
  });
});
