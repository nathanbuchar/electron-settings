/**
 * A module that handles read and writing to the disk.
 *
 * @module settings
 * @author Nathan Buchar
 * @copyright 2016-2017 Nathan Buchar <hello@nathanbuchar.com>
 * @license ISC
 */

const assert = require('assert');
const electron = require('electron');
const { EventEmitter } = require('events');
const fs = require('fs');
const jsonfile = require('jsonfile');
const path = require('path');

const Helpers = require('./settings-helpers');
const Observer = require('./settings-observer');

/**
 * A reference to the Electron app. If this framework is required within a
 * renderer processes, we need to load the app via `remote`.
 *
 * @type {string}
 */
const app = electron.app || electron.remote.app;

/**
 * The Electron app's user data path.
 *
 * @type {string}
 */
const userDataPath = app.getPath('userData');

/**
 * The name of the settings file.
 *
 * @type {string}
 */
const settingsFileName = 'Settings';

/**
 * The absolute path to the settings file.
 *
 * @type {string}
 */
const settingsFilePath = path.join(userDataPath, settingsFileName);

/**
 * The electron-settings class.
 *
 * @extends EventEmitter
 * @class
 */
class Settings extends EventEmitter {

  constructor() {
    super();

    /**
     * The absolute path to the settings file on the disk.
     *
     * @type {string}
     * @private
     */
    this._settingsFilePath = settingsFilePath;

    /**
     * The FSWatcher instance. This will watch if the settings file and
     * notify key path observers.
     *
     * @type {FSWatcher}
     * @default null
     * @private
     */
    this._fsWatcher = null;

    /**
     * Called when the settings file is changed or renamed.
     *
     * @type {Object}
     * @private
     */
    this._handleSettingsFileChange = this._onSettingsFileChange.bind(this);
  }

  /**
   * Watches the settings file for changes using the native `FSWatcher`
   * class in case the settings file is changed outside of
   * ElectronSettings' jursidiction.
   *
   * @private
   */
  _watchSettings() {
    if (!this._fsWatcher) {
      try {
        this._fsWatcher = fs.watch(this._settingsFilePath, this._handleSettingsFileChange);
      } catch (err) {
        // File may not exist yet or the user may not have permission to
        // access the file or directory. Fail gracefully.
      }
    }
  }

  /**
   * Unwatches the settings file by closing the FSWatcher and nullifying its
   * references. If the `reset` parameter is true, attempt to watch the
   * settings file again.
   *
   * @param {boolean} [reset=false]
   * @private
   */
  _unwatchSettings(reset = false) {
    if (this._fsWatcher) {
      this._fsWatcher.close();
      this._fsWatcher = null;

      if (reset) {
        this._watchSettings();
      }
    }
  }

  /**
   * Ensures that the settings file exists, then initializes the FSWatcher.
   *
   * @private
   */
  _ensureSettings() {
    try {
      jsonfile.readFileSync(this._settingsFilePath);
    } catch (err) {
      try {
        jsonfile.writeFileSync(this._settingsFilePath, {});
      } catch (err) {
        // Cannot read or write file. The user may not have permission to
        // access the file or directory. Throw error.
        throw err;
      }
    }

    this._watchSettings();
  }

  /**
   * Writes the settings to the disk.
   *
   * @param {Object} [obj={}]
   * @param {Object} [opts={}]
   * @private
   */
  _writeSettings(obj = {}, opts = {}) {
    this._ensureSettings();

    try {
      const spaces = opts.prettify ? 2 : 0;

      jsonfile.writeFileSync(this._settingsFilePath, obj, { spaces });
    } catch (err) {
      // Could not write the file. The user may not have permission to
      // access the file or directory. Throw error.
      throw err;
    }
  }

  /**
   * Returns the parsed contents of the settings file.
   *
   * @returns {Object}
   * @private
   */
  _readSettings() {
    this._ensureSettings();

    try {
      return jsonfile.readFileSync(this._settingsFilePath);
    } catch (err) {
      // Could not read the file. The user may not have permission to
      // access the file or directory. Throw error.
      throw err;
    }
  }

  /**
   * Called when the settings file has been changed or
   * renamed (moved/deleted).
   *
   * @type {string} eventType
   * @private
   */
  _onSettingsFileChange(eventType) {
    switch (eventType) {
      case Settings.FSWatcherEvents.CHANGE: {
        this._emitChangeEvent();
        break;
      }
      case Settings.FSWatcherEvents.RENAME: {
        this._unwatchSettings(true);
        break;
      }
    }
  }

  /**
   * Broadcasts the internal "change" event.
   *
   * @emits ElectronSettings:change
   * @private
   */
  _emitChangeEvent() {
    this.emit(Settings.Events.CHANGE);
  }

  /**
   * Returns a boolean indicating whether the settings object contains
   * the given key path.
   *
   * @param {string} keyPath
   * @returns {boolean}
   * @private
   */
  _checkKeyPathExists(keyPath) {
    const obj = this._readSettings();
    const exists = Helpers.hasKeyPath(obj, keyPath);

    return exists;
  }

  /**
   * Sets the value at the given key path, or the entire settings object if
   * an empty key path is given.
   *
   * @param {string} keyPath
   * @param {any} value
   * @param {Object} opts
   * @private
   */
  _setValueAtKeyPath(keyPath, value, opts) {
    let obj = value;

    if (keyPath !== '') {
      obj = this._readSettings();

      Helpers.setValueAtKeyPath(obj, keyPath, value);
    }

    this._writeSettings(obj, opts);
  }

  /**
   * Returns the value at the given key path, or sets the value at that key
   * path to the default value, if provided, if the key does not exist. If an
   * empty key path is given, the entire settings object will be returned.
   *
   * @param {string} keyPath
   * @param {any} [defaultValue]
   * @returns {any}
   * @private
   */
  _getValueAtKeyPath(keyPath, defaultValue) {
    const obj = this._readSettings();

    if (keyPath !== '') {
      const exists = Helpers.hasKeyPath(obj, keyPath);
      const value = Helpers.getValueAtKeyPath(obj, keyPath);

      // The key does not exist but a default value does. Set the value at the
      // key path to the default value and then get the new value.
      if (!exists && typeof defaultValue !== 'undefined') {
        this._setValueAtKeyPath(keyPath, defaultValue);

        // Get the new value now that the default has been set.
        return this._getValueAtKeyPath(keyPath);
      }

      return value;
    }

    return obj;
  }

  /**
   * Deletes the key and value at the given key path, or clears the entire
   * settings object if an empty key path is given.
   *
   * @param {string} keyPath
   * @param {Object} opts
   * @private
   */
  _deleteValueAtKeyPath(keyPath, opts) {
    if (keyPath === '') {
      this._writeSettings({}, opts);
    } else {
      const obj = this._readSettings();
      const exists = Helpers.hasKeyPath(obj, keyPath);

      if (exists) {
        Helpers.deleteValueAtKeyPath(obj, keyPath);
        this._writeSettings(obj, opts);
      }
    }
  }

  /**
   * Watches the given key path for changes and calls the given handler
   * if the value changes. To unsubscribe from changes, call `dispose()`
   * on the Observer instance that is returned.
   *
   * @param {string} keyPath
   * @param {Function} handler
   * @returns {Observer}
   * @private
   */
  _watchValueAtKeyPath(keyPath, handler) {
    const currentValue = this._getValueAtKeyPath(keyPath);

    return new Observer(this, keyPath, handler, currentValue);
  }

  /**
   * Returns a boolean indicating whether the settings object contains
   * the given key path.
   *
   * @param {string} keyPath
   * @returns {boolean}
   * @public
   */
  has(keyPath) {
    assert.strictEqual(typeof keyPath, 'string', 'First parameter must be a string');

    return this._checkKeyPathExists(keyPath);
  }

  /**
   * Sets the value at the given key path.
   *
   * @param {string} keyPath
   * @param {any} value
   * @param {Object} [opts={}]
   * @param {boolean} [opts.prettify=false]
   * @returns {Settings}
   * @public
   */
  set(keyPath, value, opts = {}) {
    assert.strictEqual(typeof keyPath, 'string', 'First parameter must be a string. Did you mean to use `setAll()` instead?');
    assert.strictEqual(typeof opts, 'object', 'Second parameter must be an object');

    this._setValueAtKeyPath(keyPath, value, opts);

    return this;
  }

  /**
   * Sets all settings.
   *
   * @param {Object} obj
   * @param {Object} [opts={}]
   * @param {boolean} [opts.prettify=false]
   * @returns {Settings}
   * @public
   */
  setAll(obj, opts = {}) {
    assert.strictEqual(typeof obj, 'object', 'First parameter must be an object');
    assert.strictEqual(typeof opts, 'object', 'Second parameter must be an object');

    this._setValueAtKeyPath('', obj, opts);

    return this;
  }

  /**
   * Returns the value at the given key path, or sets the value at that key
   * path to the default value, if provided, if the key does not exist.
   *
   * @param {string} keyPath
   * @param {any} [defaultValue]
   * @returns {any}
   * @public
   */
  get(keyPath, defaultValue) {
    assert.strictEqual(typeof keyPath, 'string', 'First parameter must be a string. Did you mean to use `getAll()` instead?');

    return this._getValueAtKeyPath(keyPath, defaultValue);
  }

  /**
   * Returns all settings.
   *
   * @returns {Object}
   * @public
   */
  getAll() {
    return this._getValueAtKeyPath('');
  }

  /**
   * Deletes the key and value at the given key path.
   *
   * @param {string} keyPath
   * @param {Object} [opts={}]
   * @param {boolean} [opts.prettify=false]
   * @returns {Settings}
   * @public
   */
  delete(keyPath, opts = {}) {
    assert.strictEqual(typeof keyPath, 'string', 'First parameter must be a string. Did you mean to use `deleteAll()` instead?');
    assert.strictEqual(typeof opts, 'object', 'Second parameter must be an object');

    this._deleteValueAtKeyPath(keyPath, opts);

    return this;
  }

  /**
   * Deletes all settings.
   *
   * @param {Object} [opts={}]
   * @param {boolean} [opts.prettify=false]
   * @returns {Settings}
   * @public
   */
  deleteAll(opts = {}) {
    assert.strictEqual(typeof opts, 'object', 'First parameter must be an object');

    this._deleteValueAtKeyPath('', opts);

    return this;
  }

  /**
   * Watches the given key path for changes and calls the given handler
   * if the value changes. To unsubscribe from changes, call `dispose()`
   * on the Observer instance that is returned.
   *
   * @param {string} keyPath
   * @param {Function} handler
   * @returns {Observer}
   * @public
   */
  watch(keyPath, handler) {
    assert.strictEqual(typeof keyPath, 'string', 'First parameter must be a string');
    assert.strictEqual(typeof handler, 'function', 'Second parameter must be a function');

    return this._watchValueAtKeyPath(keyPath, handler);
  }

  /**
   * Returns the absolute path to where the settings file is or will be stored.
   *
   * @returns {string}
   * @public
   */
  file() {
    return this._settingsFilePath;
  }
  
  /**
   * Set the path for the settings file to a custom value. The default is 
   * electron.app.getPath('userData').
   *
   * @param {string} path
   * @returns {boolean}
   * @public
   */
  setPath(path) {
    // default if empty param
    if (path === undefined)
      path = settingsFilePath;
    
    if (typeof path !== 'string')
      return false;
    
    // TODO: should we store the old path in case the new one's flawed?
    this._settingsFilePath = path;
    
    // TODO: update or recreate any Observers?
    // TODO: copy existing settings onto the new location? Or just call _ensureSettings()?
    
    // TODO: catch error and return false or let it bubble? Do we even need a return value?
    this._unwatchSettings(true);
    
    return true;
  }
}

/**
 * ElectronSettings event names.
 *
 * @enum {string}
 * @readonly
 */
Settings.FSWatcherEvents = {
  CHANGE: 'change',
  RENAME: 'rename'
};

/**
 * ElectronSettings event names.
 *
 * @enum {string}
 * @readonly
 */
Settings.Events = {
  CHANGE: 'change'
};

module.exports = Settings;
