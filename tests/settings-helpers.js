/* global it, describe, before, after, beforeEach, afterEach */

const assert = require('assert');

const helpers = require('../lib/settings-helpers');

describe('settings-helpers', () => {

  describe('isRootPath', () => {
    it('considers empty string as root', () => {
      assert.equal(helpers.isRootPath(''), true);
    });

    it('considers an empty array as root', () => {
      assert.equal(helpers.isRootPath([]), true);
    });

    it('considers all but "" and [] as a full path', () => {
      assert.equal(helpers.isRootPath('some.path'), false);
      assert.equal(helpers.isRootPath('else'), false);
      assert.equal(helpers.isRootPath(['this', 'path']), false);
      // Even if value is empty in array, it is not the root path
      assert.equal(helpers.isRootPath(['']), false);
    });
  });

  describe('_resolvePath', () => {
    it('resolves basic path with dots', () => {
      assert.deepEqual(
        helpers._resolvePath('first.second.third'),
        ['first', 'second', 'third']);
    });

    it('resolves path with escaped dots', () => {
      assert.deepEqual(
        helpers._resolvePath('some.th\\.ing.magic'),
        ['some', 'th.ing', 'magic']);
    });

    it('leaves array path untouched', () => {
      assert.deepEqual(
        helpers._resolvePath(['some', '.', 'path']),
        ['some', '.', 'path']);

      // Ensure that escapes are not process with arrays
      assert.deepEqual(
        helpers._resolvePath(['what', 'ab\\.out', 'this']),
        ['what', 'ab\\.out', 'this']);
    });

    it('does not consider other escaped parameters', () => {
      assert.deepEqual(
        helpers._resolvePath(['som\e', 'p\a\\th']),
        ['som\e', 'p\a\\th']);

      assert.deepEqual(
        helpers._resolvePath('som\e.p\a\\th'),
        ['som\e', 'p\a\\th']);
    });
  });

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

    it('works with an array path', () => {
      const obj = { foo: { bar: 'baz' } };
      assert.equal(helpers.hasKeyPath(obj, ['foo', 'bar']), true);
      assert.equal(helpers.hasKeyPath(obj, ['bar', 'foo']), false);
    });

    it('works with escapes', () => {
      const obj = { 'a.b': { 'c.d': 'value' } };
      assert.equal(helpers.hasKeyPath(obj, 'a\\.b.c\\.d'), true);
      assert.equal(helpers.hasKeyPath(obj, 'a.b.c.d'), false);
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

    it('works with an array path', () => {
      const obj = { foo: { bar: 'baz' } };
      assert.equal(helpers.getValueAtKeyPath(obj, ['foo', 'bar']), 'baz');
      assert.equal(helpers.getValueAtKeyPath(obj, ['bar', 'foo']), undefined);
    });

    it('works with escapes', () => {
      const obj = { 'a.b': { 'c.d': 'value' } };
      assert.equal(helpers.getValueAtKeyPath(obj, 'a\\.b.c\\.d'), 'value');
      assert.equal(helpers.getValueAtKeyPath(obj, 'a.b.c.d'), undefined);
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

    it('works with an array path', () => {
      const obj = { foo: {} };
      helpers.setValueAtKeyPath(obj, ['foo', 'bar'], 'value');
      assert.equal(obj.foo.bar, 'value');
    });

    it('works with escapes', () => {
      const obj = { 'a.b': {} };
      helpers.setValueAtKeyPath(obj, 'a\\.b.c\\.d', 'value');
      assert.equal(obj['a.b']['c.d'], 'value');
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

    it('works with an array path', () => {
      const obj = { foo: { bar: 'value' } };
      helpers.deleteValueAtKeyPath(obj, ['foo', 'bar']);
      assert.equal(Reflect.has(obj.foo, 'bar'), false);
    });

    it('works with escapes', () => {
      const obj = { 'a.b': { 'c.d': 'value' } };
      helpers.deleteValueAtKeyPath(obj, 'a\\.b.c\\.d');
      assert.equal(Reflect.has(obj['a.b'], 'c.d'), false);
    });
  });
});
