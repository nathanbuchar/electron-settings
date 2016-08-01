'use strict';

const debug = require('debug')('electron-settings');
const electron = require('electron');
const fs = require('fs-extra');
const helpers = require('key-path-helpers');
const path = require('path');
const { EventEmitter } = require('events');

const Observer = require('./observer');

/**
 * Obtain a reference to the Electron app. If electron-settings is required
 * within the context of a renderer view, we need to import it via remote.
 *
 * @see http://electron.atom.io/docs/api/app
 * @type Object
 */
const app = electron.app || electron.remote.app;

/**
 * The Settings class.
 *
 * @extends events.EventEmitter
 */
class Settings extends EventEmitter {

  constructor() {
    super();

    /**
     * Called when the "create" event fires.
     *
     * @type Function
     * @private
     */
    this._handleCreate = this._onCreate.bind(this);

    /**
     * Called when the "write" event fires.
     *
     * @type Function
     * @private
     */
    this._handleWrite = this._onWrite.bind(this);

    this._init();
  }

  /**
   * Initialize the settings instance.
   *
   * @private
   */
  _init() {
    this._initListeners();
  }

  /**
   * Register event listeners.
   *
   * @private
   */
  _initListeners() {
    this.addListener(
      Settings.Events.CREATE,
      this._handleCreate
    );

    this.addListener(
      Settings.Events.WRITE,
      this._handleWrite
    );
  }

  /**
   * Parses save options and ensures that default values are set if they are
   * not provided.
   *
   * @param {Object} [options]
   * @param {boolean} [options.atomicSaving=true]
   * @param {boolean} [options.prettify=false]
   * @param {boolean} [options.defaults={}]
   * @returns {Object}
   * @private
   */
  _parseOptions(options) {
    return Object.assign({}, Settings.DefaultOptions, options);
  }

  /**
   * Checks if the settings file currently exists on the disk.
   *
   * @returns {Promise}
   * @private
   */
  _settingsFileExists() {
    const pathToSettings = this.getSettingsFilePath();

    return new Promise((resolve, reject) => {
      fs.stat(pathToSettings, (err, stats) => {
        if (err) {
          resolve(false);
        } else {
          resolve(stats.isFile());
        }
      });
    });
  }

  /**
   * The synchronous version of `_settingsFileExists()`.
   *
   * @see _settingsFileExists
   * @returns {boolean}
   * @private
   */
  _settingsFileExistsSync() {
    const pathToSettings = this.getSettingsFilePath();

    try {
      const stats = fs.statSync(pathToSettings);

      // The path does exist, but it may be a directory. Ensure that it is
      // indeed a file.
      return stats.isFile();
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks if the settings file exists on the disk. If it does not, it is
   * created with an empty object as its contents.
   *
   * @returns {Promise}
   * @private
   */
  _ensureSettingsFile() {
    return new Promise((resolve, reject) => {
      this._settingsFileExists().then(exists => {
        if (!exists) {
          this._writeSettingsFile({}).then(resolve, reject);
          this._emitCreateEvent();
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * The synchronous version of `_ensureSettingsFile()`.
   *
   * @see _ensureSettingsFile
   * @private
   */
  _ensureSettingsFileSync() {
    if (!this._settingsFileExistsSync()) {
      this._writeSettingsFileSync({});
      this._emitCreateEvent();
    }
  }

  /**
   * Reads the settings file from the disk and parses the contents as JSON.
   *
   * @returns {Promise}
   * @private
   */
  _readSettingsFile() {
    return new Promise((resolve, reject) => {
      this._ensureSettingsFile().then(() => {
        const pathToSettings = this.getSettingsFilePath();

        // TODO handle malformed JSON?
        fs.readJson(pathToSettings, (err, obj) => {
          if (err) {
            reject(err);
          } else {
            resolve(obj);
          }
        });
      }, reject);
    });
  }

  /**
   * The synchronous version of `_readSettingsFile()`.
   *
   * @see _readSettingsFile
   * @returns {Object} obj
   * @private
   */
  _readSettingsFileSync() {
    this._ensureSettingsFileSync();

    const pathToSettings = this.getSettingsFilePath();

    // TODO handle malformed JSON?
    const obj = fs.readJsonSync(pathToSettings);

    return obj;
  }

  /**
   * Parses the given object to a JSON string and saves it to the disk. If
   * atomic saving is enabled, then we firt save a temp file, and once it has
   * been successfully written, we overwrite the old settings file.
   *
   * @param {Object} obj
   * @param {Object} [options]
   * @returns {Promise}
   * @private
   */
  _writeSettingsFile(obj, options) {
    const opts = this._parseOptions(options);
    const pathToSettings = this.getSettingsFilePath();
    const spaces = opts.prettify ? 2 : 0;

    return new Promise((resolve, reject) => {
      if (opts.atomicSaving) {
        const tmpFilePath = `${pathToSettings}-tmp`;

        fs.outputJson(tmpFilePath, obj, { spaces }, err => {
          if (!err) {
            // The tmp file has saved; Overwrite the original file.
            fs.rename(tmpFilePath, pathToSettings, err => {
              if (err) {
                reject(err);
              } else {
                this._emitWriteEvent();
                resolve();
              }
            });
          } else {
            fs.unlink(tmpFilePath, () => {
              return reject(err);
            });
          }
        });
      } else {
        fs.outputJson(pathToSettings, obj, { spaces }, err => {
          if (err) {
            reject(err);
          } else {
            this._emitWriteEvent();
            resolve();
          }
        });
      }
    });
  }

  /**
   * The synchronous version of `_writeSettingsFile()`.
   *
   * @see _writeSettingsFile
   * @private
   */
  _writeSettingsFileSync(obj, options) {
    const opts = this._parseOptions(options);
    const pathToSettings = this.getSettingsFilePath();
    const spaces = opts.prettify ? 2 : 0;

    if (opts.atomicSaving) {
      const tmpFilePath = `${pathToSettings}-tmp`;

      try {
        fs.outputJsonSync(tmpFilePath, obj, { spaces });
      } catch (e) {
        try {
          fs.unlinkSync(tmpFilePath);
        } catch (e) {
          // No operation.
        }

        // The file could not be saved. Exit early.
        return;
      }

      fs.renameSync(tmpFilePath, pathToSettings);
    } else {
      fs.outputJsonSync(pathToSettings, obj, { spaces });
    }

    this._emitWriteEvent();
  }

  /**
   * Adds a key path observer for the chosen key path.
   *
   * @param {string} keyPath
   * @param {Function} handler
   * @returns {Observer}
   * @private
   */
  _addKeyPathObserver(keyPath, handler) {
    return new Observer(this, keyPath, handler);
  }

  /**
   * Emits the "create" event.
   *
   * @emits Settings#create
   */
  _emitCreateEvent() {
    this.emit(Settings.Events.CREATE, this.getSettingsFilePath());
  }

  /**
   * Emits the "write" event.
   *
   * @emits Settings#save
   */
  _emitWriteEvent() {
    this.emit(Settings.Events.WRITE);
  }

  /**
   * Called when the "create" event fires.
   *
   * @private
   */
  _onCreate() {
    debug(`settings file created at ${this.getSettingsFilePath()}`);
  }

  /**
   * Called when the "write" event fires.
   *
   * @private
   */
  _onWrite() {
    debug(`settings file written to ${this.getSettingsFilePath()}`);
  }

  /**
   * Validates that the given key path is a string.
   *
   * @throws if key path is not a string.
   * @param {string} keyPath
   */
  _validateKeyPath(keyPath) {
    if (typeof keyPath !== 'string') {
      throw new TypeError(
        `Expected key path to be a string. Got "${typeof keyPath}".`
      );
    }
  }

  /**
   * Validates that the given defaults object is an object.
   *
   * @throws if key path is not a string or object.
   * @param {string} [keyPath]
   * @param {Object} options
   */
  _validateReset(keyPath, options) {
    if (typeof keyPath === 'string' || typeof keyPath === 'object') {
      options = typeof keyPath === 'object' ? arguments[0] : options;

      if (typeof options.defaults !== 'undefined' && typeof options.defaults !== 'object') {
        throw new TypeError(
          `Expected options.defaults to be an object. Got "${typeof options.defaults}".`
        );
      }
    } else {
      throw new TypeError(
        `Expected key path to be a string. Got "${typeof keyPath}".`
      );
    }
  }

  /**
   * Validates that the given handler function is a function.
   *
   * @throws if handler is not a function.
   * @param {Functiomn} handler
   */
  _validateHandler(handler) {
    if (typeof handler !== 'function') {
      throw new TypeError(
        `Expected handler to be an function. Got "${typeof handler}".`
      );
    }
  }

  /**
   * Validates that the params for `set()` and `setSync()` are valid.
   *
   * @throws if key path is not a string or object.
   * @throws if key path is a string but value is not an object.
   * @param {string} keyPath
   * @param {any} value
   * @param {Object} options
   */
  _validateSetParams(keyPath, value, options) {
    if (typeof keyPath === 'string') {
      if (typeof value === 'undefined') {
        throw new TypeError('Expected value to exist.');
      }
    } else if (typeof keyPath !== 'object') {
      throw new TypeError(
        `Expected key path to be a string. Got "${typeof keyPath}".`
      );
    }
  }

  /**
   * Checks if the chosen key path exists within the settings object.
   *
   * @param {string} keyPath
   * @returns {Promise}
   */
  has(keyPath) {
    this._validateKeyPath(keyPath);

    return new Promise((resolve, reject) => {
      this._readSettingsFile().then(obj => {
        const keyPathExists = helpers.hasKeyPath(obj, keyPath);

        resolve(keyPathExists);
      }, reject);
    });
  }

  /**
   * The synchronous version of `has()`.
   *
   * @see has
   */
  hasSync(keyPath) {
    this._validateKeyPath(keyPath);

    const obj = this._readSettingsFileSync();
    const keyPathExists = helpers.hasKeyPath(obj, keyPath);

    return keyPathExists;
  }

  /**
   * Gets the value at the chosen key path.
   *
   * @param {string} [keyPath=.]
   * @returns {Promise}
   */
  get(keyPath='.') {
    this._validateKeyPath(keyPath);

    return new Promise((resolve, reject) => {
      this._readSettingsFile().then(obj => {
        if (keyPath !== '.') {
          const value = helpers.getValueAtKeyPath(obj, keyPath);

          return resolve(value);
        }

        resolve(obj);
      }, reject);
    });
  }

  /**
   * The synchronous version of `get()`.
   *
   * @see get
   * @returns {any}
   */
  getSync(keyPath='.') {
    this._validateKeyPath(keyPath);

    const obj = this._readSettingsFileSync();

    if (keyPath !== '.') {
      return helpers.getValueAtKeyPath(obj, keyPath);
    }

    return obj;
  }

  /**
   * Sets the value at the chosen key path. To set the root object, simply
   * omit the key path.
   *
   * @param {string} keyPath
   * @param {any} value
   * @param {Object} [options={}]
   * @param {boolean} [options.atomicSaving=true]
   * @param {boolean} [options.prettify=false]
   * @returns {Promise}
   */
  set(keyPath, value, options) {
    this._validateSetParams(...arguments);

    if (typeof arguments[0] === 'object') {
      value = arguments[0];
      options = arguments[1];

      return this._writeSettingsFile(value, options);
    } else {
      return new Promise((resolve, reject) => {
        this._readSettingsFile().then(obj => {
          helpers.setValueAtKeyPath(obj, keyPath, value);

          this._writeSettingsFile(obj, options).then(resolve, reject);
        }, reject);
      });
    }
  }

  /**
   * The synchronous version of `set()`.
   *
   * @see set
   */
  setSync(keyPath, value, options) {
    this._validateSetParams(...arguments);

    if (typeof arguments[0] === 'object') {
      value = arguments[0];
      options = arguments[1];

      this._writeSettingsFileSync(value, options);
    } else {
      const obj = this._readSettingsFileSync();

      helpers.setValueAtKeyPath(obj, keyPath, value);

      this._writeSettingsFileSync(obj, options);
    }
  }

  /**
   * Deletes the key and value at the chosen key path.
   *
   * @param {string} keyPath
   * @param {Object} [options={}]
   * @param {boolean} [options.atomicSaving=true]
   * @param {boolean} [options.prettify=false]
   * @returns {Promise}
   */
  delete(keyPath, options={}) {
    this._validateKeyPath(keyPath, options);

    return new Promise((resolve, reject) => {
      this._readSettingsFile().then(obj => {
        helpers.deleteValueAtKeyPath(obj, keyPath);

        this._writeSettingsFile(obj, options).then(resolve, reject);
      }, reject);
    });
  }

  /**
   * The synchronous version of `delete()`.
   *
   * @see delete
   */
  deleteSync(keyPath, options={}) {
    this._validateKeyPath(keyPath);

    const obj = this._readSettingsFileSync();

    helpers.deleteValueAtKeyPath(obj, keyPath);

    this._writeSettingsFileSync(obj, options);
  }

  /**
   * Resets the chosen key path to its default value provided in
   * options.defaults. If no key path is given, reset the entire settings
   * object to defaults.
   *
   * @param {Object} [options={}]
   * @param {boolean} [options.atomicSaving=true]
   * @param {boolean} [options.prettify=false]
   * @param {Object} [options.defaults={}]
   * @returns {Promise}
   */
  reset(keyPath, options={}) {
    this._validateReset(keyPath, options);

    if (typeof keyPath === 'object') {
      options = arguments[0];
    }

    const opts = this._parseOptions(options);
    const defaults = opts.defaults;

    if (typeof keyPath === 'string') {
      return new Promise((resolve, reject) => {
        const defaultValue = helpers.getValueAtKeyPath(defaults, keyPath);

        this._readSettingsFile().then(obj => {
          let newObj;

          helpers.setValueAtKeyPath(obj, keyPath, defaultValue);

          this._writeSettingsFile(obj, opts).then(resolve, reject);
        });
      });
    } else {
      return this._writeSettingsFile(defaults, opts);
    }
  }

  /**
   * The synchronous version of `reset()`.
   *
   * @see reset
   */
  resetSync(keyPath, options={}) {
    this._validateReset(keyPath, options);

    if (typeof keyPath === 'object') {
      options = arguments[0];
    }

    const opts = this._parseOptions(options);
    const defaults = opts.defaults;

    if (typeof keyPath === 'string') {
      const defaultValue = helpers.getValueAtKeyPath(defaults, keyPath);
      const obj = this._readSettingsFileSync();

      helpers.setValueAtKeyPath(obj, keyPath, defaultValue);

      this._writeSettingsFileSync(obj, opts);
    } else {
      this._writeSettingsFileSync(defaults, opts);
    }
  }

  /**
   * Clears all settings and replaces the file contents with an empty object.
   *
   * @param {Object} [options={}]
   * @param {boolean} [options.atomicSaving=true]
   * @param {boolean} [options.prettify=false]
   * @returns {Promise}
   */
  clear(options) {
    return this._writeSettingsFile({}, options);
  }

  /**
   * The synchronous version of `clear()`.
   *
   * @see clear
   */
  clearSync(options) {
    this._writeSettingsFileSync({}, options);
  }

  /**
   * Observes the chosen key path for changes and calls the handler if the
   * value changes. Returns an Observer instance which has a `dispose` method.
   * To unsubscribe, simply call `dispose()` on the returned key path observer.
   *
   * @param {string} keyPath
   * @param {Function} handler
   * @returns {Observer}
   */
  observe(keyPath, handler) {
    this._validateKeyPath(keyPath);
    this._validateHandler(handler);

    return this._addKeyPathObserver(keyPath, handler);
  }

  /**
   * Globally configure electron-settings options.
   *
   * @param {Object} options
   * @param {boolean} [options.atomicSaving=true]
   * @param {boolean} [options.prettify=false]
   * @param {Object} [options.defaults={}]
   */
  configure(options) {
    const opts = this._parseOptions(options);

    debug(`global settings configured to ${JSON.stringify(opts)}`);

    Settings.DefaultOptions = opts;
  }

  /**
   * Returns the path to the settings file on the disk,
   *
   * @returns {string}
   */
  getSettingsFilePath() {
    return path.join(app.getPath('userData'), Settings.FileName);
  }

  /**
   * Why doesn't this exist?
   *
   * @alias EventListener.removeListener
   */
  off() {
    return this.removeListener.apply(this, arguments);
  }
};

/**
 * Default save options.
 *
 * @type Object
 * @readonly
 */
Settings.DefaultOptions = {
  atomicSaving: true,
  prettify: false,
  defaults: {}
};

/**
 * Settings event names.
 *
 * @enum {string}
 * @readonly
 */
Settings.Events = {
  CREATE: 'create',
  WRITE: 'write'
};

/**
 * The file name for the settings file.
 *
 * @type string
 * @readonly
 */
Settings.FileName = 'Settings';

/**
 * The Settings instance.
 *
 * @type Settings
 * @readonly
 */
Settings.Instance = new Settings();

module.exports = Settings.Instance;
