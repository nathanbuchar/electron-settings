const assert = require('assert');
const clone = require('clone');
const electron = require('electron');
const events = require('events');
const fs = require('fs-extra');
const path = require('path');

const Helpers = require('./settings-helpers');
const Observer = require('./settings-observer');

class Settings extends events.EventEmitter {

  constructor() {
    super();

    /**
     * Called when the settings file is changed or renamed.
     *
     * @type {Object}
     * @private
     */
    this._handleSettingsFileChange = this._onSettingsFileChange.bind(this);

    /**
     * The FSWatcher instance. This will watch if the settings file and
     * notify key path observers.
     *
     * @type {FSWatcher}
     * @default null
     * @private
     */
    this._fsWatcher = null;
  }

  /**
   * Gets the absolute path to the user settings file. This is done
   * dynamically instead of being cached during instantiation because
   * it is possible to change the user data path programatically.
   *
   * @returns {string}
   * @private
   */
  _getSettingsPath() {
    const app = electron.app || electron.remote.app;
    const userDataPath = app.getPath('userData');
    const settingsFilePath = path.join(userDataPath, 'Settings');

    return settingsFilePath;
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
      const settingsFilePath = this._getSettingsPath();

      try {
        this._fsWatcher = fs.watch(settingsFilePath, this._handleSettingsFileChange);
      } catch (err) {
        // File may not exist yet or possible user permissions error.
      }
    }
  }

  /**
   * Writes the given settings object to the disk.
   *
   * @param {Object} [obj={}]
   * @param {Object} [opts={}]
   * @private
   */
  _writeSettings(obj = {}, opts = {}) {
    const settingsFilePath = this._getSettingsPath();

    try {
      fs.outputJsonSync(settingsFilePath, obj, {
        spaces: opts.prettify ? 2 : 0
      });

      // Watch the settings file for changes, if we are not already.
      this._watchSettings();
    } catch (err) {
      // Something went wrong.
    }
  }

  /**
   * Returns the settings from the settings file, or creates the file
   * if it does not yet exist.
   *
   * @returns {Object}
   * @private
   */
  _readSettings() {
    const settingsFilePath = this._getSettingsPath();

    try {
      return fs.readJsonSync(settingsFilePath);
    } catch (err) {
      this._writeSettings();
      return {};
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
      case 'change': {
        this.emit(Settings.Events.CHANGE);
        break;
      }
      case 'rename': {
        this._fsWatcher.close();
        this._fsWatcher = null;
        break;
      }
    }
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
   * Returns the value at the given key path, or sets the value at that key
   * path to the default value, if provided, if the key does not exist. If an
   * empty key path is given, the entire settings object will be returned.
   *
   * @param {string} keyPath
   * @param {any} [defaultValue]
   * @returns {any}
   * @private
   */
  _getValueAtKeyPathWithDefaultValue(keyPath, defaultValue) {
    const obj = this._readSettings();

    if (keyPath !== '') {
      const exists = Helpers.hasKeyPath(obj, keyPath);
      const value = Helpers.getValueAtKeyPath(obj, keyPath);

      // The key does not exist but a default value does. Set the value at the
      // key path to the default value and return a copy of it.
      if (!exists && typeof defaultValue !== 'undefined') {
        Helpers.setValueAtKeyPath(obj, keyPath, defaultValue);

        return clone(defaultValue);
      }

      return value;
    }

    return obj;
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
    if (keyPath === '') {
      this._writeSettings(value, opts);
    } else {
      const obj = this._readSettings();

      Helpers.setValueAtKeyPath(obj, keyPath, value);
      this._writeSettings(obj, opts);
    }
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
      this._writeSettings({});
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
    return new Observer(this, keyPath, handler);
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
    assert.strictEqual(typeof keyPath, 'string', 'Key path parameter must be a string');

    return this._checkKeyPathExists(keyPath);
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
    assert.strictEqual(typeof keyPath, 'string', 'Key path parameter must be a string. Did you mean to use `getAll()` instead?');

    return this._getValueAtKeyPathWithDefaultValue(keyPath, defaultValue);
  }

  /**
   * Returns all settings.
   *
   * @returns {Object}
   * @public
   */
  getAll() {
    return this._getValueAtKeyPathWithDefaultValue('');
  }

  /**
   * Sets the value at the given key path.
   *
   * @param {string} keyPath
   * @param {any} value
   * @param {Object} [opts={}]
   * @param {boolean} [opts.prettify=false]
   * @public
   */
  set(keyPath, value, opts = {}) {
    assert.strictEqual(typeof keyPath, 'string', 'Key path parameter must be a string. Did you mean to use `setAll()` instead?');
    assert.strictEqual(typeof opts, 'object', 'Options parameter must be an object');

    this._setValueAtKeyPath(keyPath, value, opts);
  }

  /**
   * Sets all settings.
   *
   * @param {Object} obj
   * @param {Object} [opts={}]
   * @param {boolean} [opts.prettify=false]
   * @public
   */
  setAll(obj, opts = {}) {
    assert.strictEqual(typeof obj, 'object', 'Obj parameter must be an object');
    assert.strictEqual(typeof opts, 'object', 'Options parameter must be an object');

    this._setValueAtKeyPath('', obj, opts);
  }

  /**
   * Deletes the key and value at the given key path.
   *
   * @param {string} keyPath
   * @param {Object} [opts={}]
   * @param {boolean} [opts.prettify=false]
   * @public
   */
  delete(keyPath, opts = {}) {
    assert.strictEqual(typeof keyPath, 'string', 'Key path parameter must be a string. Did you mean to use `deleteAll()` instead?');
    assert.strictEqual(typeof opts, 'object', 'Options parameter must be an object');

    this._deleteValueAtKeyPath(keyPath, opts);
  }

  /**
   * Deletes all settings.
   *
   * @param {Object} [opts={}]
   * @param {boolean} [opts.prettify=false]
   * @public
   */
  deleteAll(opts = {}) {
    assert.strictEqual(typeof opts, 'object', 'Options parameter must be an object');

    this._deleteValueAtKeyPath('', opts);
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
    assert.strictEqual(typeof keyPath, 'string', 'Key path parameter must be a string');
    assert.strictEqual(typeof handler, 'function', 'Handler parameter must be a function');

    return this._watchValueAtKeyPath(keyPath, handler);
  }

  /**
   * Returns the absolute path to where the settings file is or will be stored.
   *
   * @returns {string}
   * @public
   */
  file() {
    return this._getSettingsPath();
  }
}

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
