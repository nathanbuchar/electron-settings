/* global it, describe, before, after, beforeEach, afterEach */

'use strict';

const chai = require('chai');
const fs = require('fs-extra');
const path = require('path');

const settings = require('../');
const helpers = require('../lib/settings-helpers');
const expect = chai.expect;
const should = chai.should();

describe('settings-helpers', () => {

  describe('hasKeyPath', () => {

    it('should return true if the simple key path exists', () => {
      const obj = { foo: 'bar' };
      const keyPathExists = helpers.hasKeyPath(obj, 'foo');

      expect(keyPathExists).to.be.true;
    });

    it('should return false if the simple key path does not exist', () => {
      const obj = { foo: 'bar' };
      const keyPathExists = helpers.hasKeyPath(obj, 'qux');

      expect(keyPathExists).to.be.false;
    });

    it('should return true if the complex key path exists', () => {
      const obj = { foo: { bar: 'baz' } };
      const keyPathExists = helpers.hasKeyPath(obj, 'foo.bar');

      expect(keyPathExists).to.be.true;
    });

    it('should return false if the complex key path does not exist', () => {
      const obj = { foo: { bar: 'baz' } };
      const keyPathExists = helpers.hasKeyPath(obj, 'foo.bar.qux');

      expect(keyPathExists).to.be.false;
    });
  });

  describe('getValueAtKeyPath', () => {

    it('should return the value at the given simple key path', () => {
      const obj = { foo: 'bar' };
      const value = helpers.getValueAtKeyPath(obj, 'foo');

      expect(value).to.deep.equal(obj.foo);
    });

    it('should return undefined if the value at the given simple key path does not exist', () => {
      const obj = { foo: 'bar' };
      const value = helpers.getValueAtKeyPath(obj, 'qux');

      expect(value).to.be.undefined;
    });

    it('should return the value at the given complex key path', () => {
      const obj = { foo: { bar: 'baz' } };
      const value = helpers.getValueAtKeyPath(obj, 'foo.bar');

      expect(value).to.deep.equal(obj.foo.bar);
    });

    it('should return undefined if the value at the given complex key path does not exist', () => {
      const obj = { foo: { bar: 'baz' } };
      const value = helpers.getValueAtKeyPath(obj, 'foo.bar.qux');

      expect(value).to.be.undefined;
    });
  });

  describe('setValueAtKeyPath', () => {

    it('should set the value at the given simple key path', () => {
      const obj = {};

      helpers.setValueAtKeyPath(obj, 'foo', 'bar');

      const value = helpers.getValueAtKeyPath(obj, 'foo');

      expect(value).to.deep.equal('bar');
    });

    it('should overwrite the value at the given simple key path', () => {
      const obj = { foo: 'bar' };

      helpers.setValueAtKeyPath(obj, 'foo', 'baz');

      const value = helpers.getValueAtKeyPath(obj, 'foo');

      expect(value).to.deep.equal('baz');
    });

    it('should set the value at the given complex key path', () => {
      const obj = {};

      helpers.setValueAtKeyPath(obj, 'foo.bar', 'baz');

      const value = helpers.getValueAtKeyPath(obj, 'foo.bar');

      expect(value).to.deep.equal('baz');
    });

    it('should overwrite the value at the given complex key path', () => {
      const obj = { foo: { bar: 'baz' } };

      helpers.setValueAtKeyPath(obj, 'foo.bar', 'qux');

      const value = helpers.getValueAtKeyPath(obj, 'foo.bar');

      expect(value).to.deep.equal('qux');
    });
  });

  describe('deleteValueAtKeyPath', () => {

    it('should delete the value at the given simple key path', () => {
      const obj = { foo: 'bar' };

      helpers.deleteValueAtKeyPath(obj, 'foo');

      const hasKeyPath = helpers.hasKeyPath(obj, 'foo');

      expect(hasKeyPath).to.be.false;
    });

    it('should delete the value at the given complex key path', () => {
      const obj = { foo: { bar: 'baz' } };

      helpers.deleteValueAtKeyPath(obj, 'foo.bar');

      const hasKeyPath = helpers.hasKeyPath(obj, 'foo.bar');

      expect(hasKeyPath).to.be.false;
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

        expect(keyExists).to.be.true;
      });

      it('should return false if the key path does not exist', () => {
        const keyExists = settings.has('qux');

        expect(keyExists).to.be.false;
      });
    });

    describe('get()', () => {

      it('should return the value at the given simple key path', () => {
        const value = settings.get('foo');

        expect(value).to.deep.equal({ bar: 'baz' });
      });

      it('should return the value at the given complex key path', () => {
        const value = settings.get('foo.bar');

        expect(value).to.deep.equal('baz');
      });

      it('should return undefined if the given key path does not exist', () => {
        const value = settings.get('snap');

        expect(value).to.be.undefined;
      });
    });

    describe('getAll()', () => {

      it('should return the entire settings object', () => {
        const value = settings.getAll();

        expect(value).to.deep.equal({ foo: { bar: 'baz' }});
      });
    });

    describe('set()', () => {

      it('should set the value at the given simple key path', () => {
        settings.set('foo', { bar: 'qux' });

        const value = settings.get('foo');

        expect(value).to.deep.equal({ bar: 'qux' });
      });

      it('should set the value at the given complex key path', () => {
        settings.set('foo.bar', 'qux');

        const value = settings.get('foo.bar');

        expect(value).to.deep.equal('qux');
      });

      it('should accept options', () => {
        settings.set('foo.bar', 'qux');

        const value = settings.get('foo.bar', { prettify: true });

        expect(value).to.deep.equal('qux');
      });
    });

    describe('setAll()', () => {

      it('should set the entire settings object', () => {
        settings.setAll({ foo: { qux:'bar' } });

        const obj = settings.getAll();

        expect(obj).to.deep.equal({ foo: { qux:'bar' } });
      });

      it('should accept options', () => {
        settings.setAll({ foo: { qux:'bar' } }, { prettify: true });

        const obj = settings.getAll();

        expect(obj).to.deep.equal({ foo: { qux:'bar' } });
      });
    });

    describe('delete()', () => {

      it('should delete the value at the given simple key path', () => {
        settings.delete('foo');

        const keyExists = settings.has('foo');

        expect(keyExists).to.be.false;
      });

      it('should delete the value at the given complex key path', () => {
        settings.delete('foo.bar');

        const keyExists = settings.has('foo.bar');

        expect(keyExists).to.be.false;
      });

      it('should accept options', () => {
        settings.delete('foo.bar', { prettify: true });

        const keyExists = settings.has('foo.bar');

        expect(keyExists).to.be.false;
      });
    });

    describe('deleteAll()', () => {

      it('should delete the entire settings object', () => {
        settings.deleteAll();

        const obj = settings.getAll();

        expect(obj).to.deep.equal({});
      });

      it('should accept options', () => {
        settings.deleteAll({ prettify: true });

        const obj = settings.getAll();

        expect(obj).to.deep.equal({});
      });
    });

    describe('watch', () => {

      it('should watch the given simple key path', done => {
        const observer = settings.watch('foo', (newValue, oldValue) => {
          expect(oldValue).to.deep.equal({ bar: 'baz' });
          expect(newValue).to.deep.equal({ bar: 'qux' });

          observer.dispose();

          done();
        });

        settings.set('foo', { bar: 'qux' });
      });

      it('should watch the given complex key path', done => {
        const observer = settings.watch('foo.bar', (newValue, oldValue) => {
          expect(oldValue).to.deep.equal('baz');
          expect(newValue).to.deep.equal('qux');

          observer.dispose();

          done();
        });

        settings.set('foo.bar', 'qux');
      });

      it('should dispose the key path watcher', done => {
        const observer = settings.watch('foo', newValue => {
          expect(newValue).to.not.exist;
        });

        observer.dispose();
        settings.set('foo', 'baz');

        done();
      });
    });
  });
});
