'use strict';

const assert = require('assert');
const debug = require('debug')('electron-settings');
const deepExtend = require('deep-extend');
const clone = require('clone');
const electron = require('electron');
const exists = require('file-exists');
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
     * The default settings Object.
     *
     * @type Object
     * @private
     */
    this._defaults = {};

    /**
     * The FSWatcher instance. This will watch if the settings file changes
     * and notify key path observers.
     *
     * @type fs.FSWatcher
     * @default null
     * @private
     */
    this._fsWatcher = null;

    /**
     * Called when the settings file has been created for the first time.
     *
     * @type Function
     * @private
     */
    this._handleSettingsCreate = this._onSettingsCreate.bind(this);

    /**
     * Called when electron=settings write to the settings file.
     *
     * @type Function
     * @private
     */
    this._handleSettingsWrite = this._onSettingsWrite.bind(this);

    /**
     * Called when the file has been changed.
     *
     * @type Function
     * @private
     */
    this._handleFileChange = this._onFileChange.bind(this);

    this._init();
  }

  /**
   * Initializes the Settings instance.
   *
   * @private
   */
  _init() {
    this._registerEvents();
    this._observeSettingsFile();
  }

  /**
   * Registers internal event handlers.
   *
   * @private
   */
  _registerEvents() {
    this.addListener(Settings.Events.CREATE, this._handleSettingsCreate);
    this.addListener(Settings.Events.WRITE, this._handleSettingsWrite);
  }

  /**
   * Observes the settings file for changes. It is possible that the settings
   * file may be changed from a system outside of electron-settings' control or
   * possible a separate electron-settings instance. If this happens, it would
   * be nice to trigger key path changes.
   *
   * @see https://nodejs.org/api/fs.html#fs_fs_watch_filename_options_listener
   * @private
   */
  _observeSettingsFile() {
    const pathToSettings = this.getSettingsFilePath();

    if (!this._fsWatcher) {
      try {
        this._fsWatcher = fs.watch(pathToSettings, this._handleFileChange);
      } catch (e) {
        // Possible user permissions error or file may not yet exist.
      }
    }
  }

  /**
   * Closes the FSWatcher and nullifies its reference if it exists.
   *
   * @private
   */
  _unobserveSettingFile() {
    if (this._fsWatcher) {
      this._fsWatcher.close();
      this._fsWatcher = null;
    }
  }

  /**
   * Resets the settings file FSWatcher.
   *
   * @private
   */
  _resetSettingsObserver() {
    this._unobserveSettingFile();
    this._observeSettingsFile();
  }

  /**
   * Configures electron-settings global default options.
   *
   * @param {Object} options
   * @private
   */
  _configureGlobalSettings(options) {
    const opts = this._extendDefaultOptions(options);

    Settings.DefaultOptions = opts;

    debug(`global settings configured to ${JSON.stringify(opts)}`);
  }

  /**
   * Sets electron-settings default settings. These will be applied upon
   * settings file creation, as well as `applyDefaults()` and
   * `resetToDefaults()`.
   *
   * @param {Object} obj
   * @private
   */
  _setDefaults(obj) {
    this._defaults = clone(obj);
  }

  /**
   * Parses save options and ensures that default values are set if they are
   * not provided.
   *
   * @param {Object} [options={}]
   * @param {boolean} [options.atomicSaving=true]
   * @param {boolean} [options.prettify=false]
   * @param {boolean} [options.overwrite=false]
   * @returns {Object}
   * @private
   */
  _extendDefaultOptions(options={}) {
    return Object.assign({}, Settings.DefaultOptions, options);
  }

  /**
   * Deletes the settings file. This may occur if the data has become corrupted
   * and can no longer be read.
   *
   * @private
   */
  _unlinkSettingsFileSync() {
    const pathToSettings = this.getSettingsFilePath();

    try {
      fs.unlinkSync(pathToSettings);

      debug(`settings file deleted at ${pathToSettings}`);
    } catch (e) {
      // Either the file doesn't exist, or you're totally fucked.
      // But probably the former.. ¯\_(ツ)_/¯
    }
  }

  /**
   * Deletes the settings file and re-ensures its existence with default
   * settings if possible. This is the doomsday scenario.
   *
   * @private
   */
  _resetSettingsFileSync() {
    this._unlinkSettingsFileSync();
    this._ensureSettingsFileSync();
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
      if (!this.settingsFileExists()) {
        const defaults = this._defaults;

        this._writeSettingsFile(defaults).then(() => {
          this._emitCreateEvent();
          resolve();
        }, reject);
      } else {
        resolve();
      }
    });
  }

  /**
   * The synchronous version of `_ensureSettingsFile()`.
   *
   * @see _ensureSettingsFile
   * @private
   */
  _ensureSettingsFileSync() {
    if (!this.settingsFileExists()) {
      const defaults = this._defaults;

      this._writeSettingsFileSync(defaults);
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

        fs.readJson(pathToSettings, (err, obj) => {
          if (err) {
            debug(`ERROR: malformed JSON detected at ${pathToSettings}`);

            this._resetSettingsFileSync();

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

    try {
      const obj = fs.readJsonSync(pathToSettings);

      return obj;
    } catch (e) {
      debug(`ERROR: malformed JSON detected at ${pathToSettings}`);

      this._resetSettingsFileSync();
    }
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
    const opts = this._extendDefaultOptions(options);
    const pathToSettings = this.getSettingsFilePath();
    const spaces = opts.prettify ? 2 : 0;

    return new Promise((resolve, reject) => {
      if (opts.atomicSaving) {
        const tmpFilePath = `${pathToSettings}-tmp`;

        fs.outputJson(tmpFilePath, obj, { spaces }, err => {
          if (!err) {
            fs.rename(tmpFilePath, pathToSettings, err => {
              if (err) {
                reject(err);
              } else {
                this._resetSettingsObserver();
                this._emitWriteEvent();
                resolve();
              }
            });
          } else {
            fs.unlink(tmpFilePath, () => {
              this._resetSettingsFileSync();
              return reject(err);
            });
          }
        });
      } else {
        fs.outputJson(pathToSettings, obj, { spaces }, err => {
          if (err) {
            reject(err);
          } else {
            this._observeSettingsFile();
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
    const opts = this._extendDefaultOptions(options);
    const pathToSettings = this.getSettingsFilePath();
    const spaces = opts.prettify ? 2 : 0;

    if (opts.atomicSaving) {
      const tmpFilePath = `${pathToSettings}-tmp`;

      try {
        fs.outputJsonSync(tmpFilePath, obj, { spaces });
        fs.renameSync(tmpFilePath, pathToSettings);
      } catch (e) {
        try {
          fs.unlinkSync(tmpFilePath);
        } catch (e) {
          // No operation.
        }

        return;
      }

      this._resetSettingsObserver();
    } else {
      fs.outputJsonSync(pathToSettings, obj, { spaces });
      this._observeSettingsFile();
    }

    this._emitWriteEvent();
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
  _onSettingsCreate() {
    debug(`settings file created at ${this.getSettingsFilePath()}`);
  }

  /**
   * Called when the "write" event fires.
   *
   * @private
   */
  _onSettingsWrite() {
    debug(`settings file written to ${this.getSettingsFilePath()}`);
  }

  /**
   * Called when the settings file has changed.
   *
   * @param {string} eventType - Either "rename" or "change".
   * @param {string} filename - The name of the file that triggered the event.
   */
  _onFileChange(eventType, filename) {
    if (eventType === Settings.FSWatcherEventTypes.CHANGE) {
      this._emitWriteEvent();
    }
  }

  /**
   * Checks if the chosen key path exists within the settings object.
   *
   * @throws if key path is not a string.
   * @param {string} keyPath
   * @returns {Promise}
   */
  has(keyPath) {
    assert.strictEqual(typeof keyPath, 'string', 'Key path must be a string');

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
    assert.strictEqual(typeof keyPath, 'string', 'Key path must be a string');

    const obj = this._readSettingsFileSync();
    const keyPathExists = helpers.hasKeyPath(obj, keyPath);

    return keyPathExists;
  }

  /**
   * Gets the value at the chosen key path.
   *
   * @param {string} [keyPath]
   * @returns {Promise}
   */
  get(keyPath) {
    return new Promise((resolve, reject) => {
      this._readSettingsFile().then(obj => {
        let value = obj;

        if (typeof keyPath === 'string') {
          value = helpers.getValueAtKeyPath(obj, keyPath);
        }

        resolve(value);
      }, reject);
    });
  }

  /**
   * The synchronous version of `get()`.
   *
   * @see get
   */
  getSync(keyPath) {
    let value = this._readSettingsFileSync();

    if (typeof keyPath === 'string') {
      value = helpers.getValueAtKeyPath(value, keyPath);
    }

    return value;
  }

  /**
   * Sets the value at the chosen key path.
   *
   * @throws if key path is not a string.
   * @throws if options is not an object.
   * @param {string} keyPath
   * @param {any} [value={}]
   * @param {Object} [options={}]
   * @returns {Promise}
   */
  set(keyPath, value={}, options={}) {
    assert.strictEqual(typeof keyPath, 'string', 'Key path must be a string');
    assert.strictEqual(typeof options, 'object', 'Options must be an object');

    return new Promise((resolve, reject) => {
      this._readSettingsFile().then(obj => {
        helpers.setValueAtKeyPath(obj, keyPath, value);

        this._writeSettingsFile(obj, options).then(resolve, reject);
      }, reject);
    });
  }

  /**
   * The synchronous version of `set()`.
   *
   * @see set
   */
  setSync(keyPath, value={}, options={}) {
    assert.strictEqual(typeof keyPath, 'string', 'Key path must be a string');
    assert.strictEqual(typeof options, 'object', 'Options must be an object');

    const obj = this._readSettingsFileSync();

    helpers.setValueAtKeyPath(obj, keyPath, value);

    this._writeSettingsFileSync(obj, options);
  }

  /**
   * Deletes the key and value at the chosen key path.
   *
   * @throws if key path is not a string.
   * @throws if options is not an object.
   * @param {string} keyPath
   * @param {Object} [options={}]
   * @returns {Promise}
   */
  delete(keyPath, options={}) {
    assert.strictEqual(typeof keyPath, 'string', 'Key path must be a string');
    assert.strictEqual(typeof options, 'object', 'Options must be an object');

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
    assert.strictEqual(typeof keyPath, 'string', 'Key path must be a string');
    assert.strictEqual(typeof options, 'object', 'Options must be an object');

    const obj = this._readSettingsFileSync();

    helpers.deleteValueAtKeyPath(obj, keyPath);

    this._writeSettingsFileSync(obj, options);
  }

  /**
   * Clears all settings and replaces the file contents with an empty object.
   *
   * @throws if options is not an object.
   * @param {Object} [options={}]
   * @param {boolean} [options.atomicSaving=true]
   * @param {boolean} [options.prettify=false]
   * @returns {Promise}
   */
  clear(options={}) {
    assert.strictEqual(typeof options, 'object', 'Options must be an object');

    return this._writeSettingsFile({}, options);
  }

  /**
   * The synchronous version of `clear()`.
   *
   * @see clear
   */
  clearSync(options={}) {
    assert.strictEqual(typeof options, 'object', 'Options must be an object');

    this._writeSettingsFileSync({}, options);
  }

  /**
   * Sets default settings.
   *
   * @throws if defaults is not an object.
   * @param {Object} [options={}
   * @returns {Promise}
   */
  defaults(defaults) {
    assert.strictEqual(typeof defaults, 'object', 'Defaults must be an object');

    this._setDefaults(defaults);
  }

  /**
   * Extends the current settings with the default settings. Optionally, you
   * may overwrite pre-existing settings with their repsective defaults by
   * setting `options.overwrite` to true. Set defaults using the `defaults()`
   * method.
   *
   * @throws if options is not an object.
   * @param {Object} [options={}]
   * @returns {Promise}
   */
  applyDefaults(options={}) {
    assert.strictEqual(typeof options, 'object', 'Options must be an object');

    return new Promise((resolve, reject) => {
      this._readSettingsFile().then(obj => {
        let newObj;

        if (options.overwrite === true) {
          newObj = deepExtend({}, obj, this._defaults);
        } else {
          newObj = deepExtend({}, this._defaults, obj);
        }

        this._writeSettingsFile(newObj, options).then(resolve, reject);
      });
    });
  }

  /**
   * The synchronous version of `applyDefaults()`.
   *
   * @see applyDefaults
   */
  applyDefaultsSync(options={}) {
    assert.strictEqual(typeof options, 'object', 'Options must be an object');

    let obj = this._readSettingsFileSync();
    let newObj;

    if (options.overwrite === true) {
      newObj = deepExtend({}, obj, this._defaults);
    } else {
      newObj = deepExtend({}, this._defaults, obj);
    }

    this._writeSettingsFileSync(newObj, options);
  }

  /**
   * Resets the settings to defaults. Set defaults using the `defaults()`
   * method.
   *
   * @throws if options is not an object.
   * @param {Object} [options={}]
   * @returns {Promise}
   */
  resetToDefaults(options={}) {
    assert.strictEqual(typeof options, 'object', 'Options must be an object');

    const defaults = this._defaults;

    return this._writeSettingsFile(defaults, options);
  }

  /**
   * The synchronous version of `resetToDefaults()`.
   *
   * @see resetToDefaults
   */
  resetToDefaultsSync(options={}) {
    assert.strictEqual(typeof options, 'object', 'Options must be an object');

    const defaults = this._defaults;

    this._writeSettingsFileSync(defaults, options);
  }

  /**
   * Observes the chosen key path for changes and calls the handler if the
   * value changes. Returns an Observer instance which has a `dispose` method.
   * To unsubscribe, simply call `dispose()` on the returned key path observer.
   *
   * @throws if key path is not a string.
   * @throws if handler is not a function.
   * @param {string} keyPath
   * @param {Function} handler
   * @returns {Observer} observer
   */
  observe(keyPath, handler) {
    assert.strictEqual(typeof keyPath, 'string', 'Key path must be a string');
    assert.strictEqual(typeof handler, 'function', 'Handler must be a function');

    const observer = new Observer(this, keyPath, handler);

    return observer;
  }

  /**
   * Globally configure electron-settings options.
   *
   * @throws if options is not an object.
   * @param {Object} options
   * @param {boolean} [options.atomicSaving=true]
   * @param {boolean} [options.prettify=false]
   * @param {Object} [options.defaults={}]
   */
  configure(options) {
    assert.strictEqual(typeof options, 'object', 'Options must be an object');

    this._configureGlobalSettings(options);
  }

  /**
   * Returns the path to the settings file on the disk,
   *
   * @returns {string} settingsFilePath
   */
  getSettingsFilePath() {
    const userDataPath = app.getPath('userData');
    const settingsFilePath = path.join(userDataPath, Settings.FileName);

    return settingsFilePath;
  }

  /**
   * Checks if the settings file currently exists on the disk.
   *
   * @returns {boolean} fileExists
   */
  settingsFileExists() {
    const pathToSettings = this.getSettingsFilePath();
    const fileExists = exists(pathToSettings);

    return fileExists;
  }

  /**
   * Why doesn't this exist?
   *
   * @alias EventListener.removeListener
   */
  off() {
    return this.removeListener.apply(this, arguments);
  }
}

/**
 * Default save options.
 *
 * @type Object
 * @readonly
 */
Settings.DefaultOptions = {
  atomicSaving: true,
  prettify: false,
  overwrite: false
};

/**
 * Settings event names.
 *
 * @enum {string}
 * @readonly
 */
Settings.Events = {
  CREATE: 'create',
  WRITE: 'write',
  CHANGE: 'change'
};

/**
 * FSWatcher event types.
 *
 * @enum {string}
 * @readonly
 */
Settings.FSWatcherEventTypes = {
  CHANGE: 'change',
  RENAME: 'rename'
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
