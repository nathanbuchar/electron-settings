/**
 * Electron Settings class definition.
 *
 * @author Nathan Buchar
 */

'use strict';

const electron = require('electron');
const events = require('events');
const debounce = require('debounce');
const debug = require('debug')('electron-settings');
const fs = require('fs-extra');
const helpers = require('key-path-helpers');
const path = require('path');

/**
 * Get reference to the Electron app. If the Electron Settings instance exists
 * outside of the Electron server, we must require it via remote.
 *
 * @see http://electron.atom.io/docs/api/remote/
 */
const app = electron.app || electron.remote.app;

/**
 * ELectron Settings class definition.
 *
 * @extends events.EventEmitter
 */
class ElectronSettings extends events.EventEmitter {

  /**
   * ElectronSettings instance constructor.
   *
   * @param {Object} [options]
   * @param {string} [options.configDirPath]
   * @param {string} [options.configFileName=settings]
   * @param {Number} [options.debouncedSaveTime=100]
   * @param {Object} [options.defaults={}]
   */
  constructor(options) {
    super();

    /**
     * Internal cache of the settings object.
     *
     * @type Object
     * @default null
     * @private
     */
    this._cache = null;

    /**
     * Settings instance options.
     *
     * @type Object
     * @default null
     * @private
     */
    this._options = null;

    /**
     * Debounces a save request.
     *
     * @type Object
     * @default null
     * @private
     */
    this._saveDebouncer = null;

    /**
     * The full path to the config file.
     *
     * @type {string}
     * @default null
     * @private
     */
    this._configFilePath = null;

    /**
     * Watches for changes on the settings file.
     *
     * @type fs.FSWatcher
     * @private
     */
    this._fsWatcher = null;

    /**
     * Internal "created" event handler.
     *
     * @type {Function}
     * @private
     */
    this._handleCreate = this._onCreate.bind(this);

    /**
     * Internal "save" event handler.
     *
     * @type {Function}
     * @private
     */
    this._handleSave = this._onSave.bind(this);

    /**
     * Handler for file change events triggered by the FSWatcher.
     *
     * @type {Function}
     * @private
     */
    this._handleFileChange = this._onFileChange.bind(this);

    this._init(options);
  }

  /**
   * Runs all necessary initialization steps.
   *
   * @param {Object} options
   * @private
   */
  _init(options) {
    this._initOptions(options);
    this._initConfigFilePath();
    this._initSettingsFile();
    this._initInternalEventBindings();
    this._initSaveDebouncer();
    this._initCache();
    this._initFSWatcher();
  }

  /**
   * Merges the default options with the user-provided instance options, if
   * they exist.
   *
   * @param {Object} [options={}]
   * @private
   */
  _initOptions(options={}) {
    this._options = Object.assign({}, ElectronSettings.Defaults, options);
  }

  /**
   * Sets up the name and path for the config file.
   *
   * @private
   */
  _initConfigFilePath() {
    this._configFilePath = path.join(
      this._options.configDirPath,
      this._options.configFileName.split('.json')[0] + '.json'
    );
  }

  /**
   * Creates the settings file if it does not exist or if the path is not a
   * file..
   *
   * @private
   */
  _initSettingsFile() {

    // Issues a debug message then creates the settings file with defaults.
    let createSettingsFile = () => {
      debug(`no settings file found at ${this._configFilePath}`);
      this._createDefaultSettingsFile();
    };

    try {
      const stats = fs.statSync(this._configFilePath);

      if (!stats.isFile()) {
        // The path exists, but it is not a file. Create one.
        createSettingsFile();
      }
    } catch (err) {
      // No config file exists at this path. Create one.
      createSettingsFile();
    }
  }

  /**
   * Sets up internal event handlers.
   *
   * @private
   */
  _initInternalEventBindings() {
    this.on(ElectronSettings.Events.CREATE, this._handleCreate);
    this.on(ElectronSettings.Events.SAVE, this._handleSave);
  }

  /**
   * Sets up the save debouncer. This ensures that save requests are not
   * overloaded.
   *
   * @private
   */
  _initSaveDebouncer() {
    this._saveDebouncer = debounce(
      this._save,
      this._options.debouncedSaveTime
    );
  }

  /**
   * Sets up the initial settings cache.
   *
   * @private
   */
  _initCache() {
    this._cache = this._readSettingsSync();
  }

  /**
   * Creates an FSWatcher to watch the config file for changes. NOTE: The
   * fs.watch API is not 100% consistent across platforms, and is unavailable
   * in some situations.
   *
   * @see https://nodejs.org/api/fs.html#fs_class_fs_fswatcher
   * @private
   */
  _initFSWatcher() {
    this._fsWatcher = fs.watch(
      this._configFilePath,
      this._handleFileChange
    );
  }

  /**
   * Creates the settings file at the file path with defaults then emits the
   * creation event.
   *
   * @private
   */
  _createDefaultSettingsFile() {
    fs.outputJsonSync(this._configFilePath, this._options.defaults);

    // Emit the creation event.
    this._emitCreateEvent();
  }

  /**
   * Called when the "create" event fires.
   *
   * @private
   */
  _handleCreate() {
    debug(`settings file created at ${this._configFilePath}`);
  }

  /**
   * Called when the "save" event fires.
   *
   * @private
   */
  _handleSave() {
    debug('settings saved successfully');
  }

  /**
   * Called when the config file changes.
   *
   * @see https://nodejs.org/api/fs.html#fs_fs_watch_filename_options_listener
   * @param {string} event - Either "rename", "change".
   * @param {string} filename
   * @private
   */
  _onFileChange(event, filename) {
    switch (event) {
      case ElectronSettings.FSWatcherEvents.RENAME:
        debug('settings file has been renamed');
        break;
      case ElectronSettings.FSWatcherEvents.CHANGE:
        debug('settings file has been changed');
        break;
    }
  }

  /**
   * Requests the Settings instance to save the internal settings cache
   * to disk. A request is made so that if debouncing is active, the request can
   * be properly debounced.
   *
   * @private
   */
  _requestSave() {
    this._saveDebouncer.call(this);
  }

  /**
   * Gets the current state of the settings file.
   *
   * @returns {Promise}
   * @private
   */
  _readSettings() {
    return new Promise((resolve, reject) => {
      fs.readJson(this._configFilePath, (err, obj) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(obj);
        }
      });
    });
  }

  /**
   * Gets the current state of the settings file (synchronous)
   *
   * @returns {Object}
   * @private
   */
  _readSettingsSync() {
    return fs.readJsonSync(this._configFilePath);
  }

  /**
   * Parses options from a given set of desired keys and returns the parsed
   * values.
   *
   * @param {string[]} keys
   * @param {Object} [options={}]
   * @returns {Object}
   * @private
   */
  _parseOptions(keys, options={}) {
    return keys.reduce((opts, key) => {
      opts[key] = ElectronSettings.DefaultOptions[key];

      // Overwrite default if option exists.
      if (key in options) {
        opts[key] = options[key];
      }

      return opts;
    }, {});
  }

  /**
   * Gets the value of a setting at the chosen key path.
   *
   * @param {string} keyPath
   * @returns {mixed} value
   * @private
   */
  _get(keyPath) {
    let value;

    if (typeof keyPath === 'undefined' || keyPath === '.') {
      value = helpers.getValueAtKeyPath(this._cache, '');
    } else if (helpers.hasKeyPath(this._cache, keyPath)) {
      value = helpers.getValueAtKeyPath(this._cache, keyPath);
    }

    return value;
  }

  /**
   * TODO
   *
   * @param {string} keyPath
   * @param {mixed} value
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave=true]
   * @returns {Promise} - Only if options.shoudlSave is true
   * @private
   */
  _set(keyPath, value, options) {
    const opts = this._parseOptions(['shouldSave'], options);

    // Update internal cache.
    if (keyPath === '' || keyPath === '.') {
      if (typeof value === 'object') {
        this._cache = Object.assign({}, value);
      } else {
        throw new TypeError(`"value" must be an Object. Got "${typeof value}"`);
      }
    } else if (helpers.hasKeyPath(this._cache, keyPath)) {
      helpers.setValueAtKeyPath(this._cache, keyPath, value);
    }

    // If we expect to save this entry, return a new promise that will be
    // resolved when the next save event fires.
    if (opts.shouldSave) {
      return new Promise((resolve, reject) => {
        this._requestSave();

        // Watch for the next save event then resolve the promise.
        this.once(ElectronSettings.Events.SAVE, resolve);
      });
    }
  }

  /**
   * Unsets the value of a setting at the chosen key path, with options.
   *
   * @param {string} keyPath
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave=true]
   * @private
   */
  _unset(keyPath, options) {
    const opts = this._parseOptions(['shouldSave'], options);

    // Update internal cache.
    if (keyPath === '' || keyPath === '.') {
      this._cache = {};
    } else if (helpers.hasKeyPath(this._cache, keyPath)) {
      helpers.deleteValueAtKeyPath(this._cache, keyPath);
    }

    // If we expect to save this entry, return a new promise that will be
    // resolved when the next save event fires.
    if (opts.shouldSave) {
      return new Promise((resolve, reject) => {
        this._requestSave();

        // Watch for the next save event then resolve the promise.
        this.once(ElectronSettings.Events.SAVE, resolve);
      });
    }
  }

  /**
   * Determines if a key exists at the given key path.
   *
   * @param {string} keyPath
   * @returns {boolean}
   */
  _has(keyPath) {
    return helpers.hasKeyPath(this._cache, keyPath);
  }

  /**
   * Applies default settings softly of forcefully via options.overwrite.
   *
   * @param {Object} defaults
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave=true]
   * @param {boolean} [options.overwrite=false]
   * @returns {Promise} - Only if options.shoudlSave is true
   * @private
   */
  _defaults(defaults, options) {
    const opts = this._parseOptions(['shouldSave', 'overwrite'], options);

    if (opts.overwrite) {
      return this._set('.', Object.assign(
        {}, this._cache, this._options.defaults
      ), opts);
    } else {
      return this._set('.', Object.assign(
        {}, this._options.defaults, this._cache
      ), opts);
    }
  }

  /**
   * Erases all settings.
   *
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave=true]
   * @returns {Promise} - Only if options.shoudlSave is true
   * @private
   */
  _clear(options) {
    return this._unset('.', options);
  }

  /**
   * Gets the value of a setting at the chosen key path.
   *
   * @param {string} keyPath
   * @returns {mixed}
   */
  get(keyPath) {
    return this._get.apply(this, arguments);
  }

  /**
   * TODO
   *
   * @param {string} keyPath
   * @param {mixed} value
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave=true]
   * @returns {Promise} - Only if options.shoudlSave is true
   */
  set(keyPath, value, options) {
    return this._set.apply(this, arguments);
  }

  /**
   * Unsets the value of a setting at the chosen key path, with options.
   *
   * @param {string} keyPath
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave=true]
   * @returns {Promise} - Only if options.shoudlSave is true
   */
  unset(keyPath, options) {
    return this._unset.apply(this, arguments);
  }

  /**
   * Determines if a key exists at the given key path.
   *
   * @param {string} keyPath
   * @returns {boolean}
   */
  has(keyPath) {
    return this._has.apply(this, arguments);
  }

  /**
   * Erases all settings.
   *
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave=true]
   * @returns {Promise} - Only if options.shoudlSave is true
   */
  clear() {
    return this._clear.apply(this, arguments);
  }

  /**
   * Softly applies default settings if that have not yet been set. NOTE: Does
   * NOT override pre-existing settings.
   *
   * @param {Object} defaults
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave=true]
   * @param {boolean} [options.overwrite=false]
   * @returns {Promise} - Only if options.shoudlSave is true
   */
  defaults() {
    return this._defaults.apply(this, arguments);
  }
}

/**
 * ElectronSettings default instance options.
 *
 * @readonly
 */
ElectronSettings.Defaults = {
  configDirPath: app.getPath('userData'),
  configFileName: 'settings',
  debouncedSaveTime: 100,
  defaults: {}
};

/**
 * ElectronSettings default option values.
 *
 * @enum {mixed}
 * @readonly
 */
ElectronSettings.DefaultOptions = {
  shouldSave: true,
  overwrite: false
};

/**
 * ElectronSettings event names.
 *
 * @enum {string}
 * @readonly
 */
ElectronSettings.Events = {
  CREATE: 'create',
  CHANGE: 'change',
  ERROR: 'error',
  SAVE: 'save'
};

/**
 * Node FSWatcher event names.
 *
 * @enum {string}
 * @readonly
 */
ElectronSettings.FSWatcherEvents = {
  RENAME: 'rename',
  CHANGE: 'change'
};

module.exports = ElectronSettings;
