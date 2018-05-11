const assert = require('assert');
const electron = require('electron');
const { EventEmitter } = require('events');
const fs = require('fs');
const jsonfile = require('jsonfile');
const path = require('path');
const _ = require('lodash');
const Observer = require('./settings-observer');
const winston = require('winston');
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
const defaultSettingsFileName = 'Settings';

/**
 * The absolute path to the settings file.
 *
 * @type {string}
 */
const defaultSettingsFilePath = path.join(userDataPath, defaultSettingsFileName);

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
     * The absolute path to the default settings file on the disk.
     *
     * @type {string}
     * @private
     */
    this._defaultSettingsFilePath = defaultSettingsFilePath;

    /**
     * The absolute path to the custom settings file on the disk.
     *
     * @type {string}
     * @default null
     * @private
     */
    this._customSettingsFilePath = null;

    /**
     * The absolute path to the custom settings file on the disk.
     *
     * @type {object}
     * @default {}
     * @private
     */
    this._cacheObj = null;
    this._watchHandlers = [];
  }

  initialize() {
    const rsp = this._readSettings();
    this._cacheObj = rsp.data;
    this.emit(Settings.Events.INITIALIZED, rsp);
    this._handleObjectChanged();
  }

  /**
   * Returns the settings file path.
   *
   * @returns {string}
   * @private
   */
  _getSettingsFilePath() {
    return this._customSettingsFilePath ?
      this._customSettingsFilePath :
      this._defaultSettingsFilePath;
  }

  _handleObjectChanged(keyPath = '') {
    const settingsFilePath = this._getSettingsFilePath();
    jsonfile.writeFileSync(settingsFilePath, this._cacheObj);
    const relatedHandler = keyPath ?
      _.filter(this._watchHandlers, f => f.keyPath.startsWith(keyPath)) :
      this._watchHandlers;
    _.forEach(relatedHandler, handler => {
      handler.onChange();
    });
  }

  /**
   * Sets a custom settings file path.
   *
   * @param {string} filePath
   * @private
   */
  _setSettingsFilePath(filePath) {
    this._customSettingsFilePath = filePath;
  }

  /**
   * Clears the custom settings file path.
   *
   * @private
   */
  _clearSettingsFilePath() {
    this._setSettingsFilePath(null);
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
  _setValueAtKeyPath(keyPath, value) {
    if (keyPath !== '') {
      _.set(this._cacheObj, keyPath, value);
    } else {
      this._cacheObj = value;
    }

    this._handleObjectChanged(keyPath);
  }

  /**
   * Returns the value at the given key path, or sets the value at that key
   * path to the default value, if provided, if the key does not exist. If an
   * empty key path is given, the entire settings object will be returned.
   *
   * @param {string} keyPath
   * @param {any} defaultValue
   * @param {Object} opts
   * @returns {any}
   * @private
   */
  _getValueAtKeyPath(keyPath, defaultValue, opts) {
    const obj = this._cacheObj;

    if (keyPath !== '') {
      const exists = _.has(obj, keyPath);
      const value = _.get(obj, keyPath);

      // The key does not exist but a default value does. Set the value at the
      // key path to the default value and then get the new value.
      if (!exists && typeof defaultValue !== 'undefined') {
        this._setValueAtKeyPath(keyPath, defaultValue, opts);
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
  _deleteValueAtKeyPath(keyPath) {
    if (keyPath === '') {
      this._cacheObj = {};
    } else {
      this._cacheObj = _.unset(this._cacheObj, keyPath);
    }

    this._handleObjectChanged(keyPath);
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

    return _.has(this._cacheObj, keyPath);
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
   * @param {Object} [opts={}]
   * @returns {any}
   * @public
   */
  get(keyPath, defaultValue, opts = {}) {
    assert.strictEqual(typeof keyPath, 'string', 'First parameter must be a string. Did you mean to use `getAll()` instead?');

    return this._getValueAtKeyPath(keyPath, defaultValue, opts);
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
    const observer = new Observer(this, keyPath, handler, _.get(this._cacheObj, keyPath));
    this._watchHandlers.push(observer);
    return observer;
  }

  unwatch(observer) {
    if (observer && observer instanceof Observer) {
      this._removeObserver(observer);
    }
  }

  _removeObserver(observer) {
    this._watchHandlers = _.reject(this._watchHandlers, n => n === observer);
  }

  /**
   * Sets a custom settings file path.
   *
   * @param {string} filePath
   * @returns {Settings}
   * @public
   */
  setPath(filePath) {
    assert.strictEqual(typeof filePath, 'string', 'First parameter must be a string');

    this._setSettingsFilePath(filePath);
    const settingsFilePath = this._getSettingsFilePath();
    jsonfile.writeFileSync(settingsFilePath, this._cacheObj);
    return this;
  }

  /**
   * Clears the custom settings file path.
   *
   * @returns {Settings}
   * @public
   */
  clearPath() {
    this._clearSettingsFilePath();
    const rsp = this._readSettings();
    this._cacheObj = rsp.data;
    return this;
  }

  _tryReadAndParseJsonFile(filePath) {
    const response = {
      isValid: false,
      raw: '',
      data: {}
    };
    if (fs.existsSync(filePath)) {
      try {
        response.raw = fs.readFileSync(filePath, 'utf8');
        response.data = JSON.parse(response.raw);
        response.isValid = true;
      } catch (e) {
        winston.error(e);
        response.isValid = false; // not json format => need to write default setting
      }
    }

    return response;
  }

  /**
   * Returns the parsed contents of the settings file.
   *
   * @returns {Object}
   * @private
   */
  _readSettings() {
    const settingsFilePath = this._getSettingsFilePath();
    const parseJsonResult = this._tryReadAndParseJsonFile(settingsFilePath);
    if (parseJsonResult.isValid) {
      return parseJsonResult;
    }

    parseJsonResult.data = {};
    jsonfile.writeFileSync(settingsFilePath, parseJsonResult.data);
    return parseJsonResult;
  }

  /**
   * Returns the absolute path to where the settings file is or will be stored.
   *
   * @returns {string}
   * @public
   */
  file() {
    return this._getSettingsFilePath();
  }
}

/**
 * ElectronSettings event names.
 *
 * @enum {string}
 * @readonly
 */
Settings.Events = {
  CHANGE: 'change',
  ERROR: 'error',
  INITIALIZED: 'initialized'
};

module.exports = Settings;
