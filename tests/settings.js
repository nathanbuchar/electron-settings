/* global it, describe, before, after, beforeEach, afterEach */

const assert = require('assert');
const electron = require('electron');
const fs = require('fs');
const path = require('path');

const settings = require('../');

describe('settings', () => {

  beforeEach('reset settings', () => {
    settings.setAll({
      foo: {
        bar: 'baz'
      }
    });
  });

  afterEach('delete settings file', () => {
    const settingsFilePath = settings.file();

    try {
      fs.unlinkSync(settingsFilePath);
    } catch (err) {
      // File may not exist.
    }
  });

  describe('methods', () => {

    describe('has()', () => {

      it('should return true if the key path exists', () => {
        const keyExists = settings.has('foo');

        assert.equal(keyExists, true);
      });

      it('should return false if the key path does not exist', () => {
        const keyExists = settings.has('qux');

        assert.equal(keyExists, false);
      });
    });

    describe('get()', () => {

      it('should return the value at the given simple key path', () => {
        const value = settings.get('foo');

        assert.deepEqual(value, { bar: 'baz' });
      });

      it('should return the value at the given complex key path', () => {
        const value = settings.get('foo.bar');

        assert.equal(value, 'baz');
      });

      it('should return undefined if the given key path does not exist', () => {
        const value = settings.get('snap');

        assert.equal(value, undefined);
      });

      it('should return the default value if the given key path does not exist', () => {
        const value = settings.get('snap', 'crackle');

        assert.equal(value, 'crackle');
      });
    });

    describe('getAll()', () => {

      it('should return the entire settings object', () => {
        const value = settings.getAll();

        assert.deepEqual(value, { foo: { bar: 'baz' } });
      });
    });

    describe('set()', () => {

      it('should return the settings instance', done => {
        assert.doesNotThrow(() => {
          settings.set('foo', 'bar').has('foo');
          done();
        });
      });

      it('should set the value at the given simple key path', () => {
        settings.set('foo', { bar: 'qux' });

        const value = settings.get('foo');

        assert.deepEqual(value, { bar: 'qux' });
      });

      it('should set the value at the given complex key path', () => {
        settings.set('foo.bar', 'qux');

        const value = settings.get('foo.bar');

        assert.equal(value, 'qux');
      });

      it('should accept options', () => {
        settings.set('foo.bar', 'qux');

        const value = settings.get('foo.bar', { prettify: true });

        assert.equal(value, 'qux');
      });
    });

    describe('setAll()', () => {

      it('should return the settings instance', done => {
        assert.doesNotThrow(() => {
          settings.setAll({ foo: 'bar' }).has('foo');
          done();
        });
      });

      it('should set the entire settings object', () => {
        settings.setAll({ foo: { qux: 'bar' } });

        const obj = settings.getAll();

        assert.deepEqual(obj, { foo: { qux: 'bar' } });
      });

      it('should accept options', () => {
        settings.setAll({ foo: { qux: 'bar' } }, { prettify: true });

        const obj = settings.getAll();

        assert.deepEqual(obj, { foo: { qux: 'bar' } });
      });
    });

    describe('delete()', () => {

      it('should return the settings instance', done => {
        assert.doesNotThrow(() => {
          settings.delete('foo').has('foo');
          done();
        });
      });

      it('should delete the value at the given simple key path', () => {
        settings.delete('foo');

        const keyExists = settings.has('foo');

        assert.equal(keyExists, false);
      });

      it('should delete the value at the given complex key path', () => {
        settings.delete('foo.bar');

        const keyExists = settings.has('foo.bar');

        assert.equal(keyExists, false);
      });

      it('should accept options', () => {
        settings.delete('foo.bar', { prettify: true });

        const keyExists = settings.has('foo.bar');

        assert.equal(keyExists, false);
      });
    });

    describe('deleteAll()', () => {

      it('should return the settings instance', done => {
        assert.doesNotThrow(() => {
          settings.deleteAll().has('foo');
          done();
        });
      });

      it('should delete the entire settings object', () => {
        settings.deleteAll();

        const obj = settings.getAll();

        assert.deepEqual(obj, {});
      });

      it('should accept options', () => {
        settings.deleteAll({ prettify: true });

        const obj = settings.getAll();

        assert.deepEqual(obj, {});
      });
    });

    describe('watch()', () => {

      it('should invoke the watch handler with the proper context', done => {
        settings.watch('foo.bar', function handler() {
          assert.doesNotThrow(() => {
            this.dispose();
            done();
          });
        });

        settings.set('foo.bar', 'qux');
      });

      it('should watch the given simple key path', done => {
        settings.watch('foo', function handler(newValue, oldValue) {
          assert.deepEqual(oldValue, { bar: 'baz' });
          assert.deepEqual(newValue, { bar: 'qux' });

          this.dispose();

          done();
        });

        settings.set('foo', { bar: 'qux' });
      });

      it('should watch the given complex key path', done => {
        settings.watch('foo.bar', function handler(newValue, oldValue) {
          assert.deepEqual(oldValue, 'baz');
          assert.deepEqual(newValue, 'qux');

          this.dispose();

          done();
        });

        settings.set('foo.bar', 'qux');
      });

      it('should watch for changes not made by electron-settings', done => {
        settings.watch('foo.bar', function handler(newValue, oldValue) {
          assert.deepEqual(oldValue, 'baz');
          assert.deepEqual(newValue, 'qux');

          this.dispose();

          done();
        });

        fs.writeFileSync(settings.file(), JSON.stringify({ foo: { bar: 'qux' } }));
      });

      it('should return undefined if the watched key path is deleted', done => {
        settings.watch('foo.bar', function handler(newValue, oldValue) {
          assert.equal(oldValue, 'baz');
          assert.equal(newValue, undefined);

          this.dispose();

          done();
        });

        settings.delete('foo.bar');
      });

      it('should dispose the key path watcher', done => {
        const observer = settings.watch('foo', () => {
          throw Error('Observer was not disposed.');
        });

        observer.dispose();
        settings.set('foo', 'baz');

        setTimeout(done, 100);
      });
    });

    describe('file()', () => {

      it('should return the path to the settings file', () => {
        const app = electron.app || electron.remote.app;
        const userDataPath = app.getPath('userData');
        const settingsFilePath = path.join(userDataPath, 'Settings');

        assert.equal(settings.file(), settingsFilePath);
      });
    });
  });
});
