/* global it, describe, before, after, beforeEach, afterEach */

'use strict';

const chai = require('chai');
const fs = require('fs-extra');
const path = require('path');

const settings = require('../');
const expect = chai.expect;
const should = chai.should();

describe('electron-settings', () => {

  beforeEach('configure electron-settings', () => {
    settings.configure({
      atomicSaving: false,
      prettify: false,
      overwrite: false
    });
  });

  beforeEach('set electron-settings defaults', () => {
    settings.defaults({
      foo: 'bar'
    });
  });

  beforeEach('reset to defaults', done => {
    settings.resetToDefaults().then(() => {
      done();
    });
  });

  describe('methods', () => {

    describe('has()', () => {

      it('should return true if the key path exists', done => {
        settings.has('foo').then(exists => {
          expect(exists).to.be.true;
          done();
        });
      });

      it('should return false if the key path does not exist', done => {
        settings.has('snap').then(exists => {
          expect(exists).to.be.false;
          done();
        });
      });

      it('should throw if no key path is given', () => {
        expect(() => {
          settings.has();
        }).to.throw(/Key path must be a string/);
      });

      it('should throw if key path is given but is not a string', () => {
        expect(() => {
          settings.has(false);
        }).to.throw(/Key path must be a string/);
      });
    });

    describe('hasSync()', () => {

      it('should return true if the key path exists', () => {
        const exists = settings.hasSync('foo');

        expect(exists).to.be.true;
      });

      it('should return false if the key path does not exist', () => {
        const exists = settings.hasSync('snap');

        expect(exists).to.be.false;
      });

      it('should throw if no key path is given', () => {
        expect(() => {
          settings.hasSync();
        }).to.throw(/Key path must be a string/);
      });

      it('should throw if key path is not a string', () => {
        expect(() => {
          settings.hasSync(false);
        }).to.throw(/Key path must be a string/);
      });
    });

    describe('get()', () => {

      it('should return the value at the chosen key path', done => {
        settings.get('foo').then(value => {
          expect(value).to.deep.equal('bar');
          done();
        });
      });

      it('should return undefined if the key path does not exist', done => {
        settings.get('snap').then(value => {
          expect(value).to.be.undefined;
          done();
        });
      });

      it('should return the entire settings object if no key path is given', done => {
        settings.get().then(value => {
          expect(value).to.deep.equal({ foo: 'bar' });
          done();
        });
      });

      it('should reset the settings file if the data is malformed', done => {
        const pathToSettings = settings.getSettingsFilePath();

        fs.outputFileSync(pathToSettings, 'not valid json');

        settings.get().then(value => {
          expect(value).to.deep.equal({ foo: 'bar' });
          done();
        });
      });
    });

    describe('getSync()', () => {

      it('should return the value at the chosen key path', () => {
        const value = settings.getSync('foo');

        expect(value).to.deep.equal('bar');
      });

      it('should return undefined if the key path does not exist', () => {
        const value = settings.getSync('snap');

        expect(value).to.be.undefined;
      });

      it('should return the entire settings object if no key path is given', () => {
        const value = settings.getSync();

        expect(value).to.deep.equal({ foo: 'bar' });
      });
    });

    describe('set()', () => {

      it('should set the value at the chosen key path to a string (atomic)', done => {
        settings.set('snap', 'crackle').then(() => {
          settings.get('snap').then(value => {
            expect(value).to.deep.equal('crackle');
            done();
          });
        });
      });

      it('should set the value at the chosen key path to a string (non-atomic)', done => {
        settings.set('snap', 'crackle', { atomicSaving: false }).then(() => {
          settings.get('snap').then(value => {
            expect(value).to.deep.equal('crackle');
            done();
          });
        });
      });

      it('should set the value at the chosen key path to a number', done => {
        settings.set('snap', 10).then(() => {
          settings.get('snap').then(value => {
            expect(value).to.deep.equal(10);
            done();
          });
        });
      });

      it('should set the value at the chosen key path to a boolean', done => {
        settings.set('snap', false).then(() => {
          settings.get('snap').then(value => {
            expect(value).to.deep.equal(false);
            done();
          });
        });
      });

      it('should set the value at the chosen key path to an object', done => {
        settings.set('snap', {
          foo: 'bar'
        }).then(() => {
          settings.get('snap').then(value => {
            expect(value).to.deep.equal({ foo: 'bar' });
            done();
          });
        });
      });

      it('should set the value at the chosen key path to null', done => {
        settings.set('snap', null).then(() => {
          settings.get('snap').then(value => {
            expect(value).to.deep.equal(null);
            done();
          });
        });
      });

      it('should overwrite a pre-existing value', done => {
        settings.set('foo', 'qux').then(() => {
          settings.get('foo').then(value => {
            expect(value).to.deep.equal('qux');
            done();
          });
        });
      });

      it('should throw if no key path is given', () => {
        expect(() => {
          settings.set();
        }).to.throw(/Key path must be a string/);
      });

      it('should throw if key path is not a string', () => {
        expect(() => {
          settings.set(false);
        }).to.throw(/Key path must be a string/);
      });

      it('should throw if options is not an object', () => {
        expect(() => {
          settings.set('foo', 'bar', false);
        }).to.throw(/Options must be an object/);
      });
    });

    describe('setSync()', () => {

      it('should set the value at the chosen key path to a string (atomic)', () => {
        settings.setSync('snap', 'crackle');

        const value = settings.getSync('snap');

        expect(value).to.deep.equal('crackle');
      });

      it('should set the value at the chosen key path to a string (non-atomic)', () => {
        settings.setSync('snap', 'crackle', { atomicSaving: false });

        const value = settings.getSync('snap');

        expect(value).to.deep.equal('crackle');
      });

      it('should set the value at the chosen key path to a number', () => {
        settings.setSync('snap', 10);

        const value = settings.getSync('snap');

        expect(value).to.deep.equal(10);
      });

      it('should set the value at the chosen key path to a boolean', () => {
        settings.setSync('snap', false);

        const value = settings.getSync('snap');

        expect(value).to.deep.equal(false);
      });

      it('should set the value at the chosen key path to an object', () => {
        settings.setSync('snap', { foo: 'bar' });

        const value = settings.getSync('snap');

        expect(value).to.deep.equal({ foo: 'bar' });
      });

      it('should set the value at the chosen key path to null', () => {
        settings.setSync('snap', null);

        const value = settings.getSync('snap');

        expect(value).to.deep.equal(null);
      });

      it('should overwrite a pre-existing value', () => {
        settings.setSync('foo', 'qux');

        const value = settings.getSync('foo');

        expect(value).to.deep.equal('qux');
      });

      it('should throw if no key path is given', () => {
        expect(() => {
          settings.setSync();
        }).to.throw(/Key path must be a string/);
      });

      it('should throw if key path is not a string', () => {
        expect(() => {
          settings.setSync(false);
        }).to.throw(/Key path must be a string/);
      });

      it('should throw if options is not an object', () => {
        expect(() => {
          settings.setSync('foo', 'bar', false);
        }).to.throw(/Options must be an object/);
      });
    });

    describe('delete()', () => {

      it('should delete the value at the chosen key path', done => {
        settings.delete('foo').then(() => {
          settings.get('foo').then(value => {
            expect(value).to.be.undefined;
            done();
          });
        });
      });

      it('should throw if no key path is given', () => {
        expect(() => {
          settings.delete();
        }).to.throw(/Key path must be a string/);
      });

      it('should throw if key path is not a string', () => {
        expect(() => {
          settings.delete(false);
        }).to.throw(/Key path must be a string/);
      });

      it('should throw if options is not an object', () => {
        expect(() => {
          settings.delete('foo', false);
        }).to.throw(/Options must be an object/);
      });
    });

    describe('deleteSync()', () => {

      it('should delete the value at the chosen key path', () => {
        settings.deleteSync('foo');

        const value = settings.getSync('foo');

        expect(value).to.be.undefined;
      });

      it('should throw if no key path is given', () => {
        expect(() => {
          settings.deleteSync();
        }).to.throw(/Key path must be a string/);
      });

      it('should throw if key path not a string', () => {
        expect(() => {
          settings.deleteSync(false);
        }).to.throw(/Key path must be a string/);
      });

      it('should throw if options is not an object', () => {
        expect(() => {
          settings.deleteSync('foo', false);
        }).to.throw(/Options must be an object/);
      });
    });

    describe('clear()', () => {

      it('should clear the entire settings object', done => {
        settings.clear().then(() => {
          settings.get().then(value => {
            expect(value).to.be.empty;
            done();
          });
        });
      });

      it('should throw if options is not an object', () => {
        expect(() => {
          settings.clear(false);
        }).to.throw(/Options must be an object/);
      });
    });

    describe('clearSync()', () => {

      it('should clear the entire settings object', () => {
        settings.clearSync();

        const value = settings.getSync();

        expect(value).to.be.empty;
      });

      it('should throw if options is not an object', () => {
        expect(() => {
          settings.clearSync(false);
        }).to.throw(/Options must be an object/);
      });
    });

    describe('defaults()', () => {

      it('should set global defaults', done => {
        settings.defaults({
          snap: 'crackle'
        });

        settings.resetToDefaults().then(() => {
          settings.get().then(obj => {
            expect(obj).to.deep.equal({ snap: 'crackle' });
            done();
          });
        });
      });

      it('should throw if defaults is not an object', () => {
        expect(() => {
          settings.defaults(false);
        }).to.throw(/Defaults must be an object/);
      });
    });

    describe('applyDefaults()', () => {

      it('should apply defaults', done => {
        settings.defaults({
          foo: 'qux',
          snap: 'crackle'
        });

        settings.applyDefaults().then(() => {
          settings.get().then(obj => {
            expect(obj).to.deep.equal({ foo: 'bar', snap: 'crackle' });
            done();
          });
        });
      });

      it('should apply defaults and overwrite pre-existing values', done => {
        settings.defaults({
          foo: 'qux',
          snap: 'crackle'
        });

        settings.applyDefaults({ overwrite: true }).then(() => {
          settings.get().then(obj => {
            expect(obj).to.deep.equal({ foo: 'qux', snap: 'crackle' });
            done();
          });
        });
      });

      it('should throw if options is not an object', () => {
        expect(() => {
          settings.applyDefaults(false);
        }).to.throw(/Options must be an object/);
      });
    });

    describe('applyDefaultsSync()', () => {

      it('should apply defaults', () => {
        settings.defaults({
          foo: 'qux',
          snap: 'crackle'
        });

        settings.applyDefaultsSync();

        const val = settings.getSync();

        expect(val).to.deep.equal({ foo: 'bar', snap: 'crackle' });
      });

      it('should apply defaults and overwrite pre-existing values', () => {
        settings.defaults({
          foo: 'qux',
          snap: 'crackle'
        });

        settings.applyDefaultsSync({ overwrite: true });

        const val = settings.getSync();

        expect(val).to.deep.equal({ foo: 'qux', snap: 'crackle' });
      });

      it('should throw if options is not an object', () => {
        expect(() => {
          settings.applyDefaults(false);
        }).to.throw(/Options must be an object/);
      });
    });

    describe('resetToDefaults()', () => {

      it('should reset to defaults', done => {
        settings.set('foo', 'qux').then(() => {
          settings.resetToDefaults().then(() => {
            settings.get().then(obj => {
              expect(obj).to.deep.equal({ foo: 'bar' });
              done();
            });
          });
        });
      });

      it('should throw if options is not an object', () => {
        expect(() => {
          settings.resetToDefaults(false);
        }).to.throw(/Options must be an object/);
      });
    });

    describe('resetToDefaultsSync()', () => {

      it('should reset to defaults', () => {
        settings.setSync('foo', 'qux');
        settings.resetToDefaultsSync();

        const val = settings.getSync();

        expect(val).to.deep.equal({ foo: 'bar' });
      });

      it('should throw if options is not an object', () => {
        expect(() => {
          settings.resetToDefaultsSync(false);
        }).to.throw(/Options must be an object/);
      });
    });

    describe('observe()', () => {

      it('should observe the given key path', done => {
        const observer = settings.observe('foo', evt => {
          expect(evt.oldValue).to.deep.equal('bar');
          expect(evt.newValue).to.deep.equal('qux');
          observer.dispose();
          done();
        });

        settings.setSync('foo', 'qux');
      });

      it('should dispose the key path observer', done => {
        const observer = settings.observe('foo', evt => {
          expect(evt).to.not.exist;
        });

        observer.dispose();
        settings.setSync('foo', 'baz');

        done();
      });

      it('should throw if no key path is given', () => {
        expect(() => {
          settings.observe();
        }).to.throw(/Key path must be a string/);
      });

      it('should throw if key path is given but is not a string', () => {
        expect(() => {
          settings.observe(false);
        }).to.throw(/Key path must be a string/);
      });

      it('should throw if no handler is given', () => {
        expect(() => {
          settings.observe('foo');
        }).to.throw(/Handler must be a function/);
      });

      it('should throw if handler is given but is not a function', () => {
        expect(() => {
          settings.observe('foo', false);
        }).to.throw(/Handler must be a function/);
      });

      it('should observe changes if updated on another (atomic) thread', done => {
        const pathToSettings = settings.getSettingsFilePath();
        const tmpFilePath = `${pathToSettings}-tmp`;

        const observer = settings.observe('foo', ({newValue, oldValue}) => {
          expect(newValue).to.deep.equal('barUpdated');
          observer.dispose();
          done();
        });

        fs.outputFileSync(tmpFilePath, '{ "foo": "barUpdated" }');
        fs.renameSync(tmpFilePath, pathToSettings);
      });
    });

    describe('configure()', () => {

      it('should globally configure electron-settings options', () => {
        settings.configure({
          prettify: true
        });
      });
    });

    describe('getSettingsFilePath()', () => {

      it('should return the path to the settings file', () => {
        expect(settings.getSettingsFilePath()).to.be.a.string;
      });
    });
  });

  describe('events', () => {

    describe('create', () => {

      it('should emit when the settings file is created', done => {
        const pathToSettings = settings.getSettingsFilePath();
        const handler = settingsFilePath => {
          expect(settingsFilePath).to.equal(pathToSettings);
          settings.removeListener('create', handler);
          done();
        };

        // Delete the settings file.
        fs.unlinkSync(pathToSettings);

        settings.on('create', handler);
        settings.getSync('foo');
      });
    });

    describe('write', () => {

      it('should emit when the settings file is written to', done => {
        const handler = () => {
          settings.removeListener('write', handler);
          done();
        };

        settings.on('write', handler);
        settings.set('foo', 'bar');
      });

      it('should emit when the settings file is written to from an external source', done => {
        const pathToSettings = settings.getSettingsFilePath();
        const handler = () => {
          settings.removeListener('write', handler);
          done();
        };

        settings.on('write', handler);

        fs.outputJsonSync(pathToSettings, { foo: 'bar' });
      });
    });
  });
});
