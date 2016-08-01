/* global it, describe, before, after, beforeEach, afterEach */

'use strict';

const chai = require('chai');
const fs = require('fs-extra');
const path = require('path');

const settings = require('../');
const expect = chai.expect;
const should = chai.should();

describe('electron-settings', () => {

  afterEach('clear the settings', () => {
    settings.clearSync();
  });

  describe('has()', () => {

    it('should return true if the key path exists', done => {
      settings.set('foo', 'bar').then(() => {
        settings.has('foo').then(exists => {
          expect(exists).to.be.true;
          done();
        });
      });
    });

    it('should return false if the key path does not exist', done => {
      settings.has('foo').then(exists => {
        expect(exists).to.be.false;
        done();
      });
    });

    it('should throw if no key path is given', () => {
      expect(() => {
        settings.has();
      }).to.throw(TypeError, /Expected key path to be a string/);
    });

    it('should throw if key path is given but is not a string', () => {
      expect(() => {
        settings.has(false);
      }).to.throw(TypeError, /Expected key path to be a string/);
    });
  });

  describe('hasSync()', () => {

    it('should return true if the key path exists', () => {
      settings.setSync('foo', 'bar');

      const exists = settings.hasSync('foo');

      expect(exists).to.be.true;
    });

    it('should return false if the key path does not exist', () => {
      const exists = settings.hasSync('foo');

      expect(exists).to.be.false;
    });

    it('should throw if no key path is given', () => {
      expect(() => {
        settings.hasSync();
      }).to.throw(TypeError, /Expected key path to be a string/);
    });

    it('should throw if key path is given but is not a string', () => {
      expect(() => {
        settings.hasSync(false);
      }).to.throw(TypeError, /Expected key path to be a string/);
    });
  });

  describe('get()', () => {

    it('should return the value at the chosen key path', done => {
      settings.set('foo', 'bar').then(() => {
        settings.get('foo').then(value => {
          expect(value).to.deep.equal('bar');
          done();
        });
      });
    });

    it('should return undefined if the key path does not exist', done => {
      settings.get('foo').then(value => {
        expect(value).to.be.undefined;
        done();
      });
    });

    it('should return the entire settings object if no key path is given', done => {
      settings.set({ foo: 'bar' }).then(() => {
        settings.get().then(value => {
          expect(value).to.deep.equal({ foo: 'bar' });
          done();
        });
      });
    });

    it('should throw if key path is given but is not a string', () => {
      expect(() => {
        settings.get(false);
      }).to.throw(TypeError, /Expected key path to be a string/);
    });
  });

  describe('getSync()', () => {

    it('should return the value at the chosen key path', () => {
      settings.setSync('foo', 'bar');

      const value = settings.getSync('foo');

      expect(value).to.deep.equal('bar');
    });

    it('should return undefined if the key path does not exist', () => {
      const value = settings.getSync('foo');

      expect(value).to.be.undefined;
    });

    it('should return the entire settings object if no key path is given', () => {
      settings.setSync({ foo: 'bar' });

      const value = settings.getSync();

      expect(value).to.deep.equal({ foo: 'bar' });
    });

    it('should throw if key path is given but is not a string', () => {
      expect(() => {
        settings.getSync(false);
      }).to.throw(TypeError, /Expected key path to be a string/);
    });
  });

  describe('set()', () => {

    it('should set the value at the chosen key path', done => {
      settings.set('foo', 'bar').then(() => {
        settings.get('foo').then(value => {
          expect(value).to.deep.equal('bar');
          done();
        });
      });
    });

    it('should set the entire settings object if not key path is given', done => {
      settings.set({ foo: 'bar' }).then(() => {
        settings.get().then(value => {
          expect(value).to.deep.equal({ foo: 'bar' });
          done();
        });
      });
    });

    it('should throw if no key path is given', () => {
      expect(() => {
        settings.set();
      }).to.throw(TypeError, /Expected key path to be a string/);
    });

    it('should throw if key path is given but is not a string or object', () => {
      expect(() => {
        settings.set(false);
      }).to.throw(TypeError, /Expected key path to be a string/);
    });

    it('should throw if key path is a string but no value is given', () => {
      expect(() => {
        settings.set('foo');
      }).to.throw(TypeError, /Expected value to exist/);
    });
  });

  describe('setSync()', () => {

    it('should set the value at the chosen key path', () => {
      settings.setSync('foo', 'bar');

      const value = settings.getSync('foo');

      expect(value).to.deep.equal('bar');
    });

    it('should set the entire settings object if not key path is given', () => {
      settings.setSync({ foo: 'bar' });

      const value = settings.getSync();

      expect(value).to.deep.equal({ foo: 'bar' });
    });

    it('should throw if no key path is given', () => {
      expect(() => {
        settings.setSync();
      }).to.throw(TypeError, /Expected key path to be a string/);
    });

    it('should throw if key path is given but is not a string or object', () => {
      expect(() => {
        settings.setSync(false);
      }).to.throw(TypeError, /Expected key path to be a string/);
    });

    it('should throw if key path is a string but no value is given', () => {
      expect(() => {
        settings.setSync('foo');
      }).to.throw(TypeError, /Expected value to exist/);
    });
  });

  describe('delete()', () => {

    it('should delete the value at the chosen key path', done => {
      settings.set('foo', 'bar').then(() => {
        settings.delete('foo').then(value => {
          settings.get('foo').then(value => {
            expect(value).to.be.undefined;
            done();
          });
        });
      });
    });

    it('should throw if no key path is given', () => {
      expect(() => {
        settings.delete();
      }).to.throw(TypeError, /Expected key path to be a string/);
    });

    it('should throw if key path is given but is not a string', () => {
      expect(() => {
        settings.delete(false);
      }).to.throw(TypeError, /Expected key path to be a string/);
    });
  });

  describe('deleteSync()', () => {

    it('should delete the value at the chosen key path', () => {
      settings.setSync('foo', 'bar');
      settings.deleteSync('foo');

      const value = settings.getSync('foo');

      expect(value).to.be.undefined;
    });

    it('should throw if no key path is given', () => {
      expect(() => {
        settings.deleteSync();
      }).to.throw(TypeError, /Expected key path to be a string/);
    });

    it('should throw if key path is given but is not a string', () => {
      expect(() => {
        settings.deleteSync(false);
      }).to.throw(TypeError, /Expected key path to be a string/);
    });
  });

  describe('reset()', () => {

    it('should reset the value at the given key path to its default value', done => {
      settings.set('foo', 'baz').then(() => {
        settings.reset('foo', { defaults: { foo: 'bar', snap: 'crackle' } }).then(() => {
          settings.get('foo').then(value => {
            expect(value).to.deep.equal('bar');
            done();
          });
        });
      });
    });

    it('should reset the entire settings object to defaults', done => {
      settings.set('foo', 'baz').then(() => {
        settings.reset({ defaults: { foo: 'bar', snap: 'crackle' } }).then(() => {
          settings.get().then(value => {
            expect(value).to.deep.equal({ foo: 'bar', snap: 'crackle' });
            done();
          });
        });
      });
    });

    it('should throw if no key path is given', () => {
      expect(() => {
        settings.reset();
      }).to.throw(TypeError, /Expected key path to be a string/);
    });

    it('should throw if options.defaults is not an object', () => {
      expect(() => {
        settings.reset('foo', { defaults: false });
      }).to.throw(TypeError, /Expected options\.defaults to be an object/);
    });
  });

  describe('resetSync()', () => {

    it('should reset the value at the given key path to its default value', () => {
      settings.setSync('foo', 'baz');
      settings.resetSync('foo', { defaults: { foo: 'bar', snap: 'crackle' } });

      const value = settings.getSync('foo');

      expect(value).to.deep.equal('bar');
    });

    it('should reset the entire settings object to defaults', () => {
      settings.setSync('foo', 'baz');
      settings.resetSync({ defaults: { foo: 'bar', snap: 'crackle' } });

      const value = settings.getSync();

      expect(value).to.deep.equal({ foo: 'bar', snap: 'crackle' });
    });

    it('should throw if no key path is given', () => {
      expect(() => {
        settings.resetSync();
      }).to.throw(TypeError, /Expected key path to be a string/);
    });

    it('should throw if options.defaults is not an object', () => {
      expect(() => {
        settings.resetSync('foo', { defaults: false });
      }).to.throw(TypeError, /Expected options\.defaults to be an object/);
    });
  });

  describe('clear()', () => {

    it('should clear the entire settings object', done => {
      settings.set('foo', 'bar').then(() => {
        settings.clear().then(() => {
          settings.get().then(value => {
            expect(value).to.be.empty;
            done();
          });
        });
      });
    });
  });

  describe('clearSync()', () => {

    it('should clear the entire settings object', () => {
      settings.setSync('foo', 'bar');
      settings.clearSync();

      const value = settings.getSync();

      expect(value).to.be.empty;
    });
  });

  describe('observer()', () => {

    it('should observe the given key path', done => {
      settings.set('foo', 'bar').then(() => {
        const observer = settings.observe('foo', evt => {
          expect(evt.oldValue).to.deep.equal('bar');
          expect(evt.newValue).to.deep.equal('baz');
          observer.dispose();
          done();
        });

        settings.setSync('foo', 'baz');
      });
    });

    it('should dispose the key path observer', done => {
      settings.set('foo', 'bar').then(() => {
        const observer = settings.observe('foo', evt => {
          expect(evt).to.not.exist;
        });

        observer.dispose();
        settings.setSync('foo', 'baz');

        done();
      });
    });

    it('should throw if no key path is given', () => {
      expect(() => {
        settings.observe();
      }).to.throw(TypeError, /Expected key path to be a string/);
    });

    it('should throw if key path is given but is not a string', () => {
      expect(() => {
        settings.observe(false);
      }).to.throw(TypeError, /Expected key path to be a string/);
    });

    it('should throw if no handler is given', () => {
      expect(() => {
        settings.observe('foo');
      }).to.throw(TypeError, /Expected handler to be an function/);
    });

    it('should throw if handler is given but is not a function', () => {
      expect(() => {
        settings.observe('foo', false);
      }).to.throw(TypeError, /Expected handler to be an function/);
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
