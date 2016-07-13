/* global it, describe, before, after, beforeEach, afterEach */

'use strict';

// const chai = require('chai');
// const fs = require('fs');
// const helpers = require('key-path-helpers');
// const path = require('path');
// const tmp = require('tmp');
//
// /**
//  * Chai assertion shorthands.
//  */
// let expect = chai.expect;
// let should = chai.should();
//
// /**
//  * Define tmp variables.
//  */
// let tmpDir;
// let tmpFile;
// let tmpSettings;
// 
// /**
//  * Generates a temporary test directory.
//  */
// before('generate temporary directory', () => {
//   tmpDir = path.resolve('test', '.tmp');
// });
//
// /**
//  * Generates a temporary settings file.
//  */
// beforeEach('generate temporary file', () => {
//   tmpFile = tmp.tmpNameSync({
//     prefix: 'tmp-',
//     dir: '.'
//   });
// });
//
// /**
//  * Create the ElectronSettings instance to test with.
//  */
// beforeEach('create ElectronSettings instance', () => {
//   settings = new ElectronSettings({
//     configDirPath: PATH_TO_TMP,
//     configFileName: tmpFileName
//   });
// });
//
// /**
//  * Delete the temporary config file.
//  */
// afterEach('destroy ElectronSettings instance', () => {
//   fs.removeSync(settings.getConfigFilePath());
// });
//
// /**
//  * Destroy the Electron Settings instance.
//  */
// afterEach('destroy ElectronSettings instance', () => {
//   settings.destroy();
//   settings = null;
// });
//
// /**
//  * Removes the temporary test directory.
//  */
// after('remove tmp directory', () => {
//   fs.removeSync(tmpDir);
// });
//
// describe('.set()', () => {
//
//   it('should set a value at the given key path', () => {
//     let keyPath = 'foo';
//     let value = 'bar';
//
//     settings.set(keyPath, value);
//
//     expect(
//       helpers.getValueAtKeyPath(settings._cache, keyPath)
//     ).to.equal(value);
//   });
// });
