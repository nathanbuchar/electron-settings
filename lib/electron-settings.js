/**
 * Electron Settings class definition.
 *
 * @author Nathan Buchar
 * @license MIT
 */

'use strict';

const debounce = require('debounce');
const debug = require('debug')('electron-settings');
const electron = require('electron');
const events = require('events');
const fs = require('fs-extra');
const helpers = require('key-path-helpers');
const path = require('path');

/**
 * Get reference to the Electron app. If the ElectronSettings instance exists
 * outside of the Electron server, we must require it via remote.
 *
 * @see http://electron.atom.io/docs/api/remote/
 */
const app = electron.app || electron.remote.app;

/**
 * Import EventEmitter.
 *
 * @see https://nodejs.org/api/events.html#events_class_eventemitter
 */
const EventEmitter = events.EventEmitter;

/**
 * ElectronSettings class definition.
 *
 * @extends events.EventEmitter
 */
class ElectronSettings extends EventEmitter {

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
     * Internal cache of the settings JSON.
     *
     * @type Object
     * @default null
     * @private
     */
    this._cache = null;

    /**
     * Options for this ElectronSettings instance.
     *
     * @type Object
     * @default null
     * @private
     */
    this._options = null;

    /**
     * Debounces a save request.
     *
     * @type Function
     * @default null
     * @private
     */
    this._debouncedSave = null;

    /**
     * The full path to the config file that is saved to the disk.
     *
     * @type string
     * @default null
     * @private
     */
    this._configFilePath = null;

    /**
     * An FSWatcher that watches for changes on the settings file.
     *
     * @type fs.FSWatcher
     * @private
     */
    this._fsWatcher = null;

    /**
     * A boolean indicating whether there is currently an attempt to save the
     * settings to disk.
     *
     * @type boolean
     * @default false
     * @private
     */
    this._isAwaitingSave = false;

    /**
     * A boolean indicating whether we are currently saving to disk.
     *
     * @type boolean
     * @default false
     * @private
     */
    this._isSaving = false;

    /**
     * Internal handler for "created" events.
     *
     * @type Function
     * @private
     */
    this._handleCreate = this._onCreate.bind(this);

    /**
     * Internal handler for "save" events.
     *
     * @type Function
     * @private
     */
    this._handleSave = this._onSave.bind(this);

    /**
     * Internal handler for "error" events.
     *
     * @type Function
     * @private
     */
    this._handleError = this._onError.bind(this);

    /**
     * Internal handler for file change events triggered by the FSWatcher
     * instance.
     *
     * @type Function
     * @private
     */
    this._handleFileChange = this._onFileChange.bind(this);

    this._init(options);
  }

  /**
   * Sets up the ElectronSettings instance.
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
   * Establishes the name and path for the config file.
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
   * Creates the settings file if it does not exist or if the path exists but
   * is not a file.
   *
   * @private
   */
  _initSettingsFile() {

    // Issues a debug message then creates the settings file with defaults.
    let createSettingsFile = () => {
      debug(`no settings file found at ${this._configFilePath}`);

      this._createDefaultSettingsFile();
    };

    // Attempt to look up the stats for the config file to determine if one
    // already exists. We do not need to read the contents of the file, so
    // opting for fs.stats is likely a faster solution.
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
    this.on(ElectronSettings.Events.ERROR, this._handleError);
  }

  /**
   * Sets up the save debouncer. This ensures that save requests are not
   * overloaded.
   *
   * @private
   */
  _initSaveDebouncer() {
    this._debouncedSave = debounce(
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
    this._cache = fs.readJsonSync(this._configFilePath);
  }

  /**
   * Creates an FSWatcher to watch the config file for changes.
   *
   * NOTE: The fs.watch API is not 100% consistent across platforms, and is
   * unavailable in some situations.
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
   * Requests the ElectronSettings instance to save the internal settings
   * cache to disk. A request is made so that, if immediate save is not desired,
   * the save request can be properly debounced.
   *
   * @param {boolean} [immediate=false]
   * @private
   */
  _requestSave(immediate=false) {
    this._isAwaitingSave = true;

    if (immediate) {
      this._save();
    } else {
      this._debouncedSave();
    }
  }

  /**
   * Clears the save queue in the event that this method was called directly,
   * then attempts to save the current contents of the cache to disk.
   *
   * NOTE: Since the save process is asynchronous, another save request may
   * occur during a save. This could happen if the sile system is acting
   * particiularly slowly, or if we are writing an enormous file. If this is
   * this case, we will exit early and re-request a save. This will continue to
   * occur until the file is finally saved. Do not worry, save requests WILL
   * NOT stack.
   *
   * @private
   */
  _save() {
    this._clearSaveRequests();

    // We're already in the middle of saving the settings. Try again and exit
    // early so as not to attempt to save at the same time.
    if (this._isSaving) {
      this._requestSave();
      return;
    }

    // Indicate that we are now attempting to save.
    this._isSaving = true;

    // Attempt to save the settings to disk at the next process tick. Waiting
    // until the next process tick is necessary to ensure that a save request
    // proceeding an immediate save is handled properly.
    process.nextTick(() => {
      fs.outputJson(this._configFilePath, this._cache, err => {
        this._isSaving = false;
        this._isAwaitingSave = false;

        if (err) {
          this._emitErrorEvent(err);
        } else {
          this._emitSaveEvent();
        }
      });
    });
  }

  /**
   * Clears any queued save requests. NOTE: This feature has not yet been
   * implemented by the debounce package and has thus been temporarily disabled.
   *
   * @private
   */
  _clearSaveRequests() {
    // this._debouncedSave.clear();
  }

  /**
   * Emits the "create" event.
   *
   * @private
   */
  _emitCreateEvent() {
    this.emit(ElectronSettings.Events.CREATE, {
      file: this._configFilePath
    });
  }

  /**
   * Emits the "save" event.
   *
   * @private
   */
  _emitSaveEvent() {
    this.emit(ElectronSettings.Events.SAVE);
  }

  /**
   * Emits the "error" event.
   *
   * @private
   */
  _emitErrorEvent(err) {
    this.emit(ElectronSettings.Events.ERROR, err);
  }

  /**
   * Emits the "change" event.
   *
   * @private
   */
  _emitChangeEvent() {
    this.emit(ElectronSettings.Events.CHANGE);
  }

  /**
   * Called when the "create" event fires.
   *
   * @private
   */
  _onCreate() {
    debug(`settings file created successfully at ${this._configFilePath}`);
  }

  /**
   * Called when the "save" event fires.
   *
   * @private
   */
  _onSave() {
    debug('settings saved successfully');
  }

  /**
   * Called when the "error" event fires.
   *
   * @private
   */
  _onError(err) {
    debug(`failed to save settings: ${err}`);
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
    if (event === ElectronSettings.FSWatcherEvents.CHANGE) {
      debug('settings file has been changed');

      // Emit the change event.
      this._emitChangeEvent();
    }
  }

  /**
   * Gets the value of a setting at the chosen key path.
   *
   * @param {string} keyPath
   * @returns {mixed} value
   */
  get(keyPath) {
    let value;

    if (typeof keyPath === 'undefined' || keyPath === '.') {
      value = helpers.getValueAtKeyPath(this._cache, '');
    } else if (helpers.hasKeyPath(keyPath)) {
      value = helpers.getValueAtKeyPath(this._cache, keyPath);
    }

    return value;
  }

  /**
   * Sets the value at the chosen key path, and then attempts to save to disk.
   *
   * @param {string} keyPath
   * @param {mixed} value
   * @param {Object} [options={}]
   * @param {boolean} [options.shouldSave=true]
   * @param {boolean} [options.saveImmediately=false]
   * @returns {Promise}
   */
  set(keyPath, value, options={}) {
    const defaults = ElectronSettings.DefaultOptions;

    // Parse options.
    const opts = Object.assign({
      shouldSave: defaults.SHOULD_SAVE,
      saveImmediately: defaults.SAVE_IMMEDIATELY
    }, options);

    // Update internal cache.
    if (keyPath === '' || keyPath === '.') {
      if (typeof value === 'object') {
        this._cache = Object.assign({}, value);
      } else {
        throw new TypeError(`"value" must be an Object. Got "${typeof value}"`);
      }
    } else if (helpers.hasKeyPath(keyPath)) {
      helpers.setValueAtKeyPath(this._cache, keyPath, value);
    }

    if (opts.shouldSave) {
      return new Promise((resolve, reject) => {
        this._requestSave(opts.saveImmediately);

        // Watch for the next save event then resolve the promise.
        this.once(ElectronSettings.Events.SAVE, resolve);
      });
    }
  }

  /**
   * Unsets the value at the chosen key path, then attempts to save to disk.
   *
   * @param {string} keyPath
   * @param {Object} [options={}]
   * @param {boolean} [options.shouldSave=true]
   * @param {boolean} [options.saveImmediately=false]
   * @returns {Promise}
   */
  unset(keyPath, options={}) {
    const defaults = ElectronSettings.DefaultOptions;

    // Parse options.
    const opts = Object.assign({
      shouldSave: defaults.SHOULD_SAVE,
      saveImmediately: defaults.SAVE_IMMEDIATELY
    }, options);

    // Update internal cache.
    if (keyPath === '' || keyPath === '.') {
      this._cache = {};
    } else if (helpers.hasKeyPath(keyPath)) {
      helpers.deleteValueAtKeyPath(this._cache, keyPath);
    }

    if (opts.shouldSave) {
      return new Promise((resolve, reject) => {
        this._requestSave(opts.saveImmediately);

        // Watch for the next save event then resolve the promise.
        this.once(ElectronSettings.Events.SAVE, resolve);
      });
    }
  }

  /**
   * Indicates if the chosen key path exists.
   *
   * @param {string} keyPath
   * @returns {boolean}
   */
  has(keyPath) {
    return helpers.hasKeyPath(this._cache, keyPath);
  }

  /**
   * Erases all settings via the "unset" method.
   *
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave=true]
   * @param {boolean} [options.saveImmediately=false]
   * @returns {Promise}
   */
  clear(options) {
    return this.unset('.', options);
  }

  /**
   * Merges the current settings cache with default options. By default, the
   * default options will not overwrite settings that already exist, but this
   * behavior can be changed by setting options.overwrite to true.
   *
   * @param {Object} obj
   * @param {Object} [options={}]
   * @param {boolean} [options.shouldSave=true]
   * @param {boolean} [options.saveImmediately=false]
   * @param {boolean} [options.overwrite=false]
   * @returns {Promise}
   */
  defaults(obj, options={}) {
    const defaults = ElectronSettings.DefaultOptions;

    // Parse options.
    const opts = Object.assign({
      shouldSave: defaults.SHOULD_SAVE,
      saveImmediately: defaults.SAVE_IMMEDIATELY,
      overwrite: defaults.OVERWRITE
    }, options);

    if (opts.overwrite) {
      return this.set('.', Object.assign({}, this._cache, obj), opts);
    } else {
      return this.set('.', Object.assign({}, obj, this._cache), opts);
    }
  }

  /**
   * Determines if we can quit the Electron app safely. Unsafely quitting may
   * interrupt saving to disk and lead to unsaved or corrupted data.
   *
   * @returns {boolean}
   */
  canQuitSafely() {
    if (this._isSaving || this._isAwaitingSave) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Returns the path to the config file on the disk.
   *
   * @returns {string}
   */
  getConfigFilePath() {
    return this._configFilePath;
  }

  /**
   * Alias for "removeListener". Why does this not already exist?
   *
   * @alias events.EventEmitter.removeListener
   */
  off() {
    this.removeListener.apply(this, arguments);
  }

  /**
   * Destroys the ElectronSettings instance gracefully. This ensures that any
   * lingering event handlers or callbacks are removed so as to prevent memory
   * leaks.
   */
  destroy() {
    this._clearSaveRequests();

    this.removeListener(Settings.Events.CREATE, this._handleCreate);
    this.removeListener(Settings.Events.CHANGE, this._handleChange);
    this.removeListener(Settings.Events.SAVE, this._handleSave);
    this.removeListener(Settings.Events.ERROR, this._handleError);

    this.removeAllListeners();

    this._cache = null;
    this._options = null;
    this._debouncedSave = null;
    this._configFilePath = null;
    this._fsWatcher = null;
    this._isAwaitingSave = null;
    this._isSaving = null;
    this._handleCreate = null;
    this._handleSave = null;
    this._handleError = null;
    this._handleChange = null;
    this._handleFileChange = null;
  }
}

/**
 * ElectronSettings default instance options.
 *
 * @readonly
 */
ElectronSettings.Defaults = {
  configDirPath: app.getPath('userData'),
  configFileName: 'settings.json',
  debouncedSaveTime: 100,
  defaults: {}
};

/**
 * ElectronSettings default option values.
 *
 * @enum {boolean}
 * @readonly
 */
ElectronSettings.DefaultOptions = {
  SHOULD_SAVE: true,
  SAVE_IMMEDIATELY: false,
  OVERWRITE: false
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
  SAVE: 'save',
  ERROR: 'error'
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
