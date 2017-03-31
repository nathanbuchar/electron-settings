/* global it, describe, before, after, beforeEach, afterEach */

const assert = require('assert');

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
