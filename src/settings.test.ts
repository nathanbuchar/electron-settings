/* eslint-env mocha, jest */
/* eslint import/no-extraneous-dependencies: ['error', { devDependencies: true }] */

import assert from 'assert';
import electron from 'electron';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import randomstring from 'randomstring';
import rimraf from 'rimraf';

import settings from './settings';

const rootDir = path.join(__dirname, '..');
const tmpDir = path.join(rootDir, 'tmp');

function getUserDataPath() {
  const app = electron.app || electron.remote.app;
  const userDataPath = app.getPath('userData');

  return userDataPath;
}

function createTestDir() {
  const rand = randomstring.generate(7);
  const dir = path.join(tmpDir, rand);

  mkdirp.sync(dir);

  return dir;
}

describe('Electron Settings', () => {

  let dir: string;

  // Create a test dir for each test.
  beforeEach(() => {
    dir = createTestDir();

    settings.configure({
      dir,
    });
  });

  // Delete user data files and reset settings config.
  afterEach(() => {
    rimraf.sync(`${getUserDataPath()}/*`);
    settings.reset();
  });

  // Delete tmp files.
  after(() => {
    rimraf.sync(tmpDir);
  });

  it('should exist', () => {
    assert(settings);
  });

  describe('methods', () => {

    describe('#configure', () => {
      it('should update the configuration', () => {
        assert.equal(settings.file(), path.join(dir, 'settings.json'));

        const fileName = 'foo.json';
        settings.configure({
          dir,
          fileName,
        });

        assert.equal(settings.file(), path.join(dir, fileName));
      });
    });

    describe('#file', () => {

      context('by default', () => {
        it('should point to "settings.json" within the app\'s user data directory', () => {
          settings.reset();

          const userDataPath = getUserDataPath();

          assert.equal(settings.file(), path.join(userDataPath, 'settings.json'));
        });
      });

      context('when a custom directory was defined', () => {
        it('should point to "settings.json" within the custom directory', () => {
          assert.equal(settings.file(), path.join(dir, 'settings.json'));
        });
      });

      context('when a custom file name was defined', () => {
        it('should point to the custom file within the app\'s user data directory', () => {
          const fileName = 'foo.json';
          const userDataPath = getUserDataPath();

          settings.reset();
          settings.configure({ fileName });

          assert.equal(settings.file(), path.join(userDataPath, fileName));
        });
      });

      context('when both a custom directory and file name were defined', () => {
        it('should point to the custom file within the custom directory', () => {
          const fileName = 'foo.json';

          settings.configure({ fileName });

          assert.equal(settings.file(), path.join(dir, fileName));
        });
      });
    });

    describe('#has', () => {
      it('should check the value at the key path', async () => {
        const seed = { foo: [{ bar: 'baz' }] };

        fs.writeFileSync(settings.file(), JSON.stringify(seed));

        const hasBar = await settings.has('foo[0].bar');
        const hasQux = await settings.has('foo[0].qux');

        assert.deepStrictEqual(hasBar, true);
        assert.deepStrictEqual(hasQux, false);
      });
    });

    describe('#hasSync', () => {

      context('when no key path is given', () => {
        it('should get all settings', () => {
          const seed = { foo: [{ bar: 'baz' }] };

          fs.writeFileSync(settings.file(), JSON.stringify(seed));

          const obj = settings.getSync();

          assert.deepStrictEqual(obj, seed);
        });
      });

      context('when key path is given', () => {
        it('should get the value at the key path', () => {
          const seed = { foo: [{ bar: 'baz' }] };

          fs.writeFileSync(settings.file(), JSON.stringify(seed));

          const value = settings.getSync('foo[0].bar');

          assert.deepStrictEqual(value, seed.foo[0].bar);
        });
      });
    });

    describe('#get', () => {

      context('when no key path is given', () => {
        it('should get all settings', async () => {
          const seed = { foo: [{ bar: 'baz' }] };

          fs.writeFileSync(settings.file(), JSON.stringify(seed));

          const obj = await settings.get();

          assert.deepStrictEqual(obj, seed);
        });
      });

      context('when key path is given', () => {
        it('should get the value at the key path', async () => {
          const seed = { foo: [{ bar: 'baz' }] };

          fs.writeFileSync(settings.file(), JSON.stringify(seed));

          const value = await settings.get('foo[0].bar');

          assert.deepStrictEqual(value, seed.foo[0].bar);
        });
      });
    });

    describe('#getSync', () => {

      context('when no key path is given', () => {
        it('should get all settings', () => {
          const seed = { foo: [{ bar: 'baz' }] };

          fs.writeFileSync(settings.file(), JSON.stringify(seed));

          const obj = settings.getSync();

          assert.deepStrictEqual(obj, seed);
        });
      });

      context('when key path is given', () => {
        it('should get the value at the key path', () => {
          const seed = { foo: [{ bar: 'baz' }] };

          fs.writeFileSync(settings.file(), JSON.stringify(seed));

          const value = settings.getSync('foo[0].bar');

          assert.deepStrictEqual(value, seed.foo[0].bar);
        });
      });
    });

    describe('#set', () => {

      context('when no key path is given', () => {
        it('should set all settings', async () => {
          const seed = { foo: [{ bar: 'baz' }] };

          fs.writeFileSync(settings.file(), JSON.stringify(seed));

          await settings.set(seed);
          const obj = await settings.get();

          assert.deepStrictEqual(obj, seed);
        });
      });

      context('when key path is given', () => {
        it('should set the value at the key path', async () => {
          const seed = { foo: [{ bar: 'baz' }] };

          fs.writeFileSync(settings.file(), JSON.stringify(seed));

          const beforeValue = await settings.get('foo[0].bar');
          assert.deepStrictEqual(beforeValue, seed.foo[0].bar);

          await settings.set('foo[0].bar', 'qux');
          const afterValue = await settings.get('foo[0].bar');

          assert.deepStrictEqual(afterValue, 'qux');
        });
      });
    });

    describe('#setSync', () => {

      context('when no key path is given', () => {
        it('should set all settings', () => {
          const seed = { foo: [{ bar: 'baz' }] };

          fs.writeFileSync(settings.file(), JSON.stringify(seed));

          settings.setSync(seed);
          const obj = settings.getSync();

          assert.deepStrictEqual(obj, seed);
        });
      });

      context('when key path is given', () => {
        it('should set the value at the key path', () => {
          const seed = { foo: [{ bar: 'baz' }] };

          fs.writeFileSync(settings.file(), JSON.stringify(seed));

          const beforeValue = settings.getSync('foo[0].bar');
          assert.deepStrictEqual(beforeValue, seed.foo[0].bar);

          settings.setSync('foo[0].bar', 'qux');
          const afterValue = settings.getSync('foo[0].bar');

          assert.deepStrictEqual(afterValue, 'qux');
        });
      });
    });

    describe('#unset', () => {

      context('when no key path is given', () => {
        it('should unset all settings', async () => {
          const seed = { foo: [{ bar: 'baz' }] };

          fs.writeFileSync(settings.file(), JSON.stringify(seed));

          await settings.unset();
          const obj = await settings.get();

          assert.deepStrictEqual(obj, {});
        });
      });

      context('when key path is given', () => {
        it('should unset the value at the key path', async () => {
          const seed = { foo: [{ bar: 'baz' }] };

          fs.writeFileSync(settings.file(), JSON.stringify(seed));

          const beforeValue = await settings.get('foo[0].bar');
          assert.deepStrictEqual(beforeValue, seed.foo[0].bar);

          await settings.unset('foo[0].bar');
          const afterValue = await settings.unset('foo[0].bar');

          assert.deepStrictEqual(afterValue, undefined);
        });
      });
    });

    describe('#unsetSync', () => {

      context('when no key path is given', () => {
        it('should unset all settings', () => {
          const seed = { foo: [{ bar: 'baz' }] };

          fs.writeFileSync(settings.file(), JSON.stringify(seed));

          settings.unsetSync();
          const obj = settings.getSync();

          assert.deepStrictEqual(obj, {});
        });
      });

      context('when key path is given', () => {
        it('should unset the value at the key path', () => {
          const seed = { foo: [{ bar: 'baz' }] };

          fs.writeFileSync(settings.file(), JSON.stringify(seed));

          const beforeValue = settings.getSync('foo[0].bar');
          assert.deepStrictEqual(beforeValue, seed.foo[0].bar);

          settings.unsetSync('foo[0].bar');
          const afterValue = settings.getSync('foo[0].bar');

          assert.deepStrictEqual(afterValue, undefined);
        });
      });
    });
  });

  describe('options', () => {

    describe('atomicSave', () => {

      context('when not given', () => {

        it('should not reject when saving', async () => {
          await settings.set('foo', 'bar');
        });

        it('should not throw when saving synchronously', () => {
          settings.setSync('foo', 'bar');
        });
      });

      context('when false', () => {

        it('should not reject when saving', async () => {
          await settings.set('foo', 'bar');
        });

        it('should not throw when saving synchronously', () => {
          settings.setSync('foo', 'bar');
        });
      });
    });

    describe('dir', () => {

      context('when not given', () => {

        it('should save to the user data path', (done) => {
          const filePath = path.join(getUserDataPath(), 'settings.json');

          settings.reset();

          assert.deepStrictEqual(filePath, settings.file());

          settings.set('foo', 'bar').then(() => {
            // If this errors, then the file does not exist.
            fs.stat(filePath, (err) => {
              assert.ifError(err);
              done();
            });
          });
        });
      });

      context('when given', () => {

        it('should save to the given directory', (done) => {
          const dir = createTestDir();
          const filePath = path.join(dir, 'settings.json');

          settings.configure({ dir });

          assert.deepStrictEqual(filePath, settings.file());

          settings.set('foo', 'bar').then(() => {
            // If this errors, then the file does not exist.
            fs.stat(filePath, (err) => {
              assert.ifError(err);
              done();
            });
          });
        });

        it('should create the given directory if it does not exist', (done) => {
          const testDir = createTestDir();
          const filePath = path.join(testDir, 'settings.json');

          settings.configure({ dir: testDir });

          settings.set('foo', 'bar').then(() => {
            // If this errors, then the file does not exist.
            fs.stat(filePath, (err) => {
              assert.ifError(err);
              done();
            });
          });
        });

        it('should create the given directory synchronously if it does not exist', () => {
          const testDir = createTestDir();
          const filePath = path.join(testDir, 'settings.json');

          settings.configure({ dir: testDir });
          settings.setSync('foo', 'bar');

          // If this throws, then the file does not exist.
          fs.statSync(filePath);
        });
      });
    });

    describe('fileName', () => {

      context('when not given', () => {

        it('should save to "settings.json"', (done) => {
          assert.deepStrictEqual(settings.file(), path.join(dir, 'settings.json'));

          settings.set('foo', 'bar').then(() => {
            fs.readFile(path.join(dir, 'settings.json'), 'utf-8', (err, data) => {
              assert.ifError(err);
              assert.ok(/^{"foo":"bar"}$/.test(data));
              done();
            });
          });
        });
      });

      context('when "test.json"', () => {

        it('should save to "test.json"', (done) => {
          const fileName = 'test.json';

          settings.configure({ fileName });

          assert.deepStrictEqual(settings.file(), path.join(dir, fileName));

          settings.set('foo', 'bar').then(() => {
            fs.readFile(path.join(dir, fileName), 'utf-8', (err, data) => {
              assert.ifError(err);
              assert.ok(/^{"foo":"bar"}$/.test(data));
              done();
            });
          });
        });
      });
    });

    describe('prettify', () => {

      context('when not given', () => {

        it('should not prettify the output when saving', (done) => {
          settings.set('foo', 'bar').then(() => {
            fs.readFile(settings.file(), 'utf-8', (err, data) => {
              assert.ifError(err);
              assert.ok(/^{"foo":"bar"}$/.test(data));
              done();
            });
          });
        });
      });

      context('when true', () => {

        it('should prettify the output when saving', (done) => {
          settings.configure({ prettify: true });

          settings.set('foo', 'bar').then(() => {
            fs.readFile(settings.file(), 'utf-8', (err, data) => {
              assert.ifError(err);
              assert.ok(/^{\n\s+"foo":\s"bar"\n}$/.test(data));
              done();
            });
          });
        });
      });
    });

    describe('numSpaces', () => {

      context('when not given', () => {

        it('should prettify the output with two spaces when saving', (done) => {
          settings.configure({ prettify: true, numSpaces: 2 });

          settings.set('foo', 'bar').then(() => {
            fs.readFile(settings.file(), 'utf-8', (err, data) => {
              assert.ifError(err);
              assert.ok(/^{\n(\s){2}"foo": "bar"\n}$/.test(data));
              done();
            });
          });
        });
      });

      context('when 4', () => {

        it('should prettify the output with four spaces when saving', (done) => {
          settings.configure({ prettify: true, numSpaces: 4 });

          settings.set('foo', 'bar').then(() => {
            fs.readFile(settings.file(), 'utf-8', (err, data) => {
              assert.ifError(err);
              assert.ok(/^{\n(\s){4}"foo": "bar"\n}$/.test(data));
              done();
            });
          });
        });
      });
    });
  });
});
