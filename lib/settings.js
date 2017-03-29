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
    this._handleSettingsChange = this._onSettingsChange.bind(this);

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
        this._fsWatcher = fs.watch(settingsFilePath, this._handleSettingsChange);
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
  _onSettingsChange(eventType) {
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
    const obj = this._readSettings();
    const keyPathExists = Helpers.hasKeyPath(obj, keyPath);

    return keyPathExists;
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
    const obj = this._readSettings();
    const keyPathExists = Helpers.hasKeyPath(obj, keyPath);
    const value = Helpers.getValueAtKeyPath(obj, keyPath);

    if (!keyPathExists && typeof defaultValue !== 'undefined') {
      Helpers.setValueAtKeyPath(obj, keyPath, defaultValue);

      return clone(defaultValue);
    }

    return value;
  }

  /**
   * Returns all settings.
   *
   * @returns {Object}
   * @public
   */
  getAll() {
    const obj = this._readSettings();

    return obj;
  }

  /**
   * Sets the value at the given key path.
   *
   * @param {string} keyPath
   * @param {any} value
   * @param {Object} [opts]
   * @public
   */
  set(keyPath, value, opts) {
    const obj = this._readSettings();

    Helpers.setValueAtKeyPath(obj, keyPath, value);
    this._writeSettings(obj, opts);
  }

  /**
   * Sets all settings.
   *
   * @param {Object}
   * @param {Object} [opts]
   * @public
   */
  setAll(obj, opts) {
    if (typeof obj === 'object') {
      this._writeSettings(obj, opts);
    }
  }

  /**
   * Deletes the key and value at the given key path.
   *
   * @param {string} keyPath
   * @param {Object} [opts]
   * @public
   */
  delete(keyPath, opts) {
    const obj = this._readSettings();
    const keyPathExists = Helpers.hasKeyPath(obj, keyPath);

    if (keyPathExists) {
      Helpers.deleteValueAtKeyPath(obj, keyPath);
      this._writeSettings(obj, opts);
    }
  }

  /**
   * Deletes all settings.
   *
   * @public
   */
  deleteAll() {
    this._writeSettings({});
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
