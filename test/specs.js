/* global it, describe, before, after, beforeEach, afterEach */

const assert = require('assert');

const settings = require('../');
const helpers = require('../lib/settings-helpers');

describe('settings-helpers', () => {

  describe('hasKeyPath()', () => {

    it('should return true if the simple key path exists', () => {
      const obj = { foo: 'bar' };
      const keyPathExists = helpers.hasKeyPath(obj, 'foo');

      assert.equal(keyPathExists, true);
    });

    it('should return false if the simple key path does not exist', () => {
      const obj = { foo: 'bar' };
      const keyPathExists = helpers.hasKeyPath(obj, 'qux');

      assert.equal(keyPathExists, false);
    });

    it('should return true if the complex key path exists', () => {
      const obj = { foo: { bar: 'baz' } };
      const keyPathExists = helpers.hasKeyPath(obj, 'foo.bar');

      assert.equal(keyPathExists, true);
    });

    it('should return false if the complex key path does not exist', () => {
      const obj = { foo: { bar: 'baz' } };
      const keyPathExists = helpers.hasKeyPath(obj, 'foo.bar.qux');

      assert.equal(keyPathExists, false);
    });
  });

  describe('getValueAtKeyPath()', () => {

    it('should return the value at the given simple key path', () => {
      const obj = { foo: 'bar' };
      const value = helpers.getValueAtKeyPath(obj, 'foo');

      assert.equal(value, obj.foo);
    });

    it('should return undefined if the value at the given simple key path does not exist', () => {
      const obj = { foo: 'bar' };
      const value = helpers.getValueAtKeyPath(obj, 'qux');

      assert.equal(value, undefined);
    });

    it('should return the value at the given complex key path', () => {
      const obj = { foo: { bar: 'baz' } };
      const value = helpers.getValueAtKeyPath(obj, 'foo.bar');

      assert.equal(value, obj.foo.bar);
    });

    it('should return undefined if the value at the given complex key path does not exist', () => {
      const obj = { foo: { bar: 'baz' } };
      const value = helpers.getValueAtKeyPath(obj, 'foo.bar.qux');

      assert.equal(value, undefined);
    });
  });

  describe('setValueAtKeyPath()', () => {

    it('should set the value at the given simple key path', () => {
      const obj = {};

      helpers.setValueAtKeyPath(obj, 'foo', 'bar');

      const value = helpers.getValueAtKeyPath(obj, 'foo');

      assert.equal(value, 'bar');
    });

    it('should overwrite the value at the given simple key path', () => {
      const obj = { foo: 'bar' };

      helpers.setValueAtKeyPath(obj, 'foo', 'baz');

      const value = helpers.getValueAtKeyPath(obj, 'foo');

      assert.equal(value, 'baz');
    });

    it('should set the value at the given complex key path', () => {
      const obj = {};

      helpers.setValueAtKeyPath(obj, 'foo.bar', 'baz');

      const value = helpers.getValueAtKeyPath(obj, 'foo.bar');

      assert.equal(value, 'baz');
    });

    it('should overwrite the value at the given complex key path', () => {
      const obj = { foo: { bar: 'baz' } };

      helpers.setValueAtKeyPath(obj, 'foo.bar', 'qux');

      const value = helpers.getValueAtKeyPath(obj, 'foo.bar');

      assert.equal(value, 'qux');
    });
  });

  describe('deleteValueAtKeyPath()', () => {

    it('should delete the value at the given simple key path', () => {
      const obj = { foo: 'bar' };

      helpers.deleteValueAtKeyPath(obj, 'foo');

      const hasKeyPath = helpers.hasKeyPath(obj, 'foo');

      assert.equal(hasKeyPath, false);
    });

    it('should delete the value at the given complex key path', () => {
      const obj = { foo: { bar: 'baz' } };

      helpers.deleteValueAtKeyPath(obj, 'foo.bar');

      const hasKeyPath = helpers.hasKeyPath(obj, 'foo.bar');

      assert.equal(hasKeyPath, false);
    });
  });
});

describe('settings', () => {

  beforeEach('reset settings', () => {
    settings.setAll({
      foo: {
        bar: 'baz'
      }
    });
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
    });

    describe('getAll()', () => {

      it('should return the entire settings object', () => {
        const value = settings.getAll();

        assert.deepEqual(value, { foo: { bar: 'baz' } });
      });
    });

    describe('set()', () => {

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

      it('should watch the given simple key path', done => {
        const observer = settings.watch('foo', (newValue, oldValue) => {
          assert.deepEqual(oldValue, { bar: 'baz' });
          assert.deepEqual(newValue, { bar: 'qux' });

          observer.dispose();

          done();
        });

        settings.set('foo', { bar: 'qux' });
      });

      it('should watch the given complex key path', done => {
        const observer = settings.watch('foo.bar', (newValue, oldValue) => {
          assert.deepEqual(oldValue, 'baz');
          assert.deepEqual(newValue, 'qux');

          observer.dispose();

          done();
        });

        settings.set('foo.bar', 'qux');
      });

      it('should dispose the key path watcher', done => {
        const observer = settings.watch('foo', () => {
          throw Error('Observer was not disposed.');
        });

        observer.dispose();
        settings.set('foo', 'baz');

        setTimeout(done, 500);
      });
    });
  });
});
