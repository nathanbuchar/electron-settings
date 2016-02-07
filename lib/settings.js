/**
 * @fileoverview User settings manager for Electron.
 * @author Nathan Buchar
 */

'use strict';

let _ = require('lodash');
let deepDiff = require('deep-diff');
let events = require('events');
let fs = require('fs-extra');
let keyMirror = require('key-mirror');
let path = require('path');
let minimatch = require('minimatch');

/**
 * Import key path helpers.
 */
let keyPathHelpers = require('./key-path-helpers');

/**
 * Configure debugger.
 */
let debug = require('debug')('electron-settings');

/**
 * @const {string} APP_NAME
 * @description The ElectronSettings app name.
 */
const APP_NAME = 'electron-settings';

/**
 * @const {string} DEFAULT_CONFIG_DIR_PATH
 * @description The path to the directory where the config file will be saved.
 */
const DEFAULT_CONFIG_DIR_PATH = (function () {
  try {
    let electron = require('electron');

    let app = electron.app || require('electron');
    let userDataPath = app.getPath('userData');

    return path.join(userDataPath, APP_NAME);
  } catch (err) {
    return null;
  }
}());

/**
 * @const {string} DEFAULT_CONFIG_FILE_NAME
 * @description The config file's name.
 */
const DEFAULT_CONFIG_FILE_NAME = 'settings';

/**
 * @const {number} DEFAULT_DEBOUNCE_SAVE_TIME
 * @description The default debounce save time.
 */
const DEFAULT_DEBOUNCE_SAVE_TIME = 100;

/**
 * @class ElectronSettings
 * @extends EventEmitter
 */
class ElectronSettings extends events.EventEmitter {

  /**
   * ElectronSettings class constructor.
   *
   * @param {Object} [options]
   * @constructor
   */
  constructor(options) {
    super();

    /**
     * Internal cache of the settings object.
     *
     * @type Object
     * @private
     */
    this._settingsCache = {};

    /**
     * KeyPath watchers. The watched key path is the map key, and the watch
     * handler is the map value.
     *
     * @type Map
     * @private
     */
    this._watchList = new Map();

    /**
     * ElectronSettings instance options.
     *
     * @type Object
     * @private
     */
    this._options = _.defaults(options || {}, ElectronSettings.Defaults);

    /**
     * Debounces a save request.
     *
     * @type Object
     * @private
     */
    this._debouncedSave = _.debounce(
      this._saveToDisk,
      this._options.debounceSaveTime,
      {
        maxWait: 1000
      }
    );

    /**
     * Internal change event handler.
     *
     * @see _handleChange
     * @type {Function}
     * @private
     */
    this._onChange = this._handleChange.bind(this);

    /**
     * Internal error event handler.
     *
     * @see _handleError
     * @type {Function}
     * @private
     */
    this._onError = this._handleError.bind(this);

    /**
     * Internal save event handler.
     *
     * @see _handleSave
     * @type {Function}
     * @private
     */
    this._onSave = this._handleSave.bind(this);

    /**
     * The full path to the config file.
     *
     * @type {string}
     * @default null
     * @private
     */
    this._configFilePath = null;

    this._init(options);
  }

  /**
   * Initialize the ElectronSettings instance.
   *
   * @private
   */
  _init() {
    this._initConfigFile()
      .then(() => this._setInitialSettings())
      .then(() => this._ready())
      .catch(err => {
        throw err;
      }
    );
  }

  /**
   * Ensures that the config file exists. If the file does not exist, it is
   * created and an empty Object is written.
   *
   * @returns {Promise}
   * @private
   */
  _initConfigFile() {
    return new Promise((resolve, reject) => {
      this._configFilePath = path.join(
        this._options.configDirPath, this._options.configFileName + '.json');

      debug('checking for config file at ' + this._configFilePath);

      // Check if the file already exists.
      fs.readFile(this._configFilePath, (err, data) => {
        if (err && err.code === 'ENOENT') {
          debug('no config file found at ' + this._configFilePath);

          // The file does not already exist; Write to disk.
          fs.outputJson(this._configFilePath, {}, err => {
            if (err) {
              return reject(err);
            }

            debug('config file generated at ' + this._configFilePath);

            return resolve();
          });
        } else {
          debug('found pre-existing config file at ' + this._configFilePath);

          return resolve();
        }
      });
    });
  }

  /**
   * Reads the config file and caches the data internally.
   *
   * @returns {Promise}
   * @private
   */
  _setInitialSettings() {
    return new Promise((resolve, reject) => {
      this._read()
        .then(obj => {
          this._settingsCache = obj || {};
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Called when the ElectronSettings instance is ready. Performs any final
   * setup then emits the ready event.
   *
   * @private
   */
  _ready() {
    debug('ElectronSettings instance is ready');

    this.on('change', this._onChange);
    this.on('error', this._onError);

    this._emitReadyEvent();
  }

  /**
   * Called when the "change" event fires. This checks the watch list for any
   * watched keys and calls their respective watch handlers if the changed key
   * paths match.
   *
   * @param {Object} data
   * @param {Array.<Object>} data.changed
   * @private
   */
  _handleChange(data) {
    debug('change detected with data ' + JSON.stringify(data));

    this._watchList.forEach((watchHandler, watchKeyPath) => {
      _.forEach(data.changed, change => {
        if (minimatch(change.keyPath, watchKeyPath)) {
          watchHandler(change);
        }
      });
    });
  }

  /**
   * Called when the "error" event fires.
   *
   * @param {Error} err
   * @private
   */
  _handleError(err) {
    debug('encountered error: ' + err);
  }

  /**
   * Called when the "save" event fires.
   *
   * @private
   */
  _handleSave() {
    debug('settings successfully saved at ' + this._configFilePath);
  }

  /**
   * Gets an Array of changed items between two objects. Utilizes deep-diff.
   *
   * @see _parseDifferences
   * @see _compileDifferences
   * @see {@link https://npmjs.org/package/deep-diff}
   * @param {Object} before
   * @param {Object} after
   * @returns {Array.<Object>} differences
   * @private
   */
  _getChanged(before, after) {
    let differences = deepDiff.diff(before, after);

    differences = this._parseDifferences(differences);
    differences = this._compileDifferences(differences);

    return differences;
  }

  /**
   * Parses the deep-diff differences array into a more friendly and
   * ElectronSettings-scoped format.
   *
   * @param {Array.<Object>} differences
   * @returns {Array.<Object>}
   * @private
   */
  _parseDifferences(differences) {
    return _.map(differences, difference => {
      let diff = {};
      let keyPathBase = _.last(difference.path);
      let isEditedArray = _.isNumber(keyPathBase);

      diff.action = ElectronSettings.ChangeActionsMap[difference.kind];

      if (isEditedArray) {
        diff.item = {};

        diff.index = keyPathBase;
        diff.action = ElectronSettings.ChangeActions.ARRAY;
        diff.keyPath = difference.path.slice(0, difference.path.length - 1).join('.');

        diff.item.action = ElectronSettings.ChangeActionsMap[difference.kind];

        // Rewrite `lhs` to `item.was`, if it exists.
        if (difference.lhs) {
          diff.item.was = difference.lhs;
        }

        // Rewrite `rhs` to `item.now`, if it exists.
        if (difference.rhs) {
          diff.item.now = difference.rhs;
        }
      } else if (diff.action === ElectronSettings.ChangeActions.ARRAY) {
        diff.item = {};

        diff.index = difference.index;
        diff.keyPath = difference.path.join('.');

        diff.item.action = ElectronSettings.ChangeActionsMap[difference.item.kind];

        // Rewrite `item.lhs` to `item.was`, if it exists.difference
        if (difference.item.lhs) {
          diff.item.was = difference.item.lhs;
        }

        // Rewrite `item.rhs` to `item.now`, if it exists.
        if (difference.item.rhs) {
          diff.item.now = difference.item.rhs;
        }
      } else {
        diff.keyPath = difference.path.join('.');

        // Rewrite `lhs` to `was`, if it exists.
        if (difference.lhs) {
          diff.was = difference.lhs;
        }

        // Rewrite `rhs` to `now`, if it exists.
        if (difference.rhs) {
          diff.now = difference.rhs;
        }
      }

      return diff;
    });
  }

  /**
   * Compiles the parsed deep-diff differences so that items changed within an
   * array are not separated, but grouped into a single different Object.
   *
   * @param {Array.<Object>} differences
   * @returns {Array.<Object>} diffs
   * @private
   */
  _compileDifferences(differences) {
    let diffs = [];

    _.forEach(differences, difference => {
      if (difference.action !== ElectronSettings.ChangeActions.ARRAY) {
        diffs.push(difference);
      } else {
        let index = _.findIndex(diffs, { keyPath: difference.keyPath });
        let item = _.cloneDeep(difference.item);

        item.index = difference.index;

        if (index >= 0) {
          diffs[index].items.push(item);
        } else {
          diffs.push({
            action: ElectronSettings.ChangeActions.ARRAY,
            keyPath: difference.keyPath,
            items: [item]
          });
        }
      }
    });

    return diffs;
  }

  /**
   * Requests the ElectronSettings instance to save the internal settings cache
   * to disk. A request is made so that if debouncing is active, the request can
   * be properly throttled.
   *
   * @see _saveToDisk
   * @private
   */
  _requestSave() {
    this._debouncedSave.call(this);
  }

  /**
   * Saves the internal settings cache to disk.
   *
   * @private
   */
  _saveToDisk() {
    debug('saving settings to disk...');

    fs.writeJson(this._configFilePath, this._settingsCache, err => {
      if (err) {
        let err = new Error('Failed to save ' + path.basename(this._configFilePath));

        return this._emitErrorEvent(err);
      }

      this._emitSaveEvent();
    });
  }

  /**
   * Reads the current contents of the config file.
   *
   * @returns {Promise}
   * @private
   */
  _read() {
    return new Promise((resolve, reject) => {
      fs.readFile(this._configFilePath, (err, data) => {
        if (err) {
          return reject(err);
        }

        try {
          let obj = JSON.parse(data);

          resolve(obj);
        } catch (err) {
          let error = new Error('malformed settings data');

          this._emitErrorEvent(error);

          reject(error);
        }
      });
    });
  }

  /**
   * Gets the value of a setting at the chosen key path.
   *
   * @param {string} keyPath
   * @returns {mixed}
   * @private
   */
  _get(keyPath) {
    if (_.isUndefined(keyPath) || keyPath === '.') {
      return this._settingsCache;
    } else if (this._validateKeyPath(keyPath), true) {
      return keyPathHelpers.getValueAtKeyPath(this._settingsCache, keyPath);
    }
  }

  /**
   * Sets the value of a setting at the chosen key path, with options.
   *
   * @param {string} keyPath
   * @param {mixed} value
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave]
   * @private
   */
  _set(keyPath, value, options) {
    let opts = this._parseOptions(options);
    let orig = _.cloneDeep(this._settingsCache);

    if (keyPath === '.') {
      if (_.isObject(value)) {
        this._settingsCache = value;
      } else {
        throw new TypeError(`"value" must be an Object. Got: ${typeof value}`);
      }
    } else if (this._validateKeyPath(keyPath), true) {
      keyPathHelpers.setValueAtKeyPath(this._settingsCache, keyPath, value);
    }

    if (opts.shouldSave) {
      this._requestSave();
    }

    this._emitChangeEvent({
      changed: this._getChanged(orig, this._settingsCache)
    });
  }

  /**
   * Unsets the value of a setting at the chosen key path, with options.
   *
   * @param {string} keyPath
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave]
   * @private
   */
  _unset(keyPath, options) {
    let opts = this._parseOptions(options);
    let orig = _.clone(this._settingsCache);

    if (keyPath === '.') {
      return this._empty();
    }

    if (this._validateKeyPath(keyPath), true) {
      keyPathHelpers.deleteValueAtKeyPath(this._settingsCache, keyPath);
    }

    if (opts.shouldSave) {
      this._requestSave();
    }

    this._emitChangeEvent({
      changed: this._getChanged(orig, this._settingsCache)
    });
  }

  /**
   * Erases all settings.
   *
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave]
   * @private
   */
  _empty(options) {
    let opts = this._parseOptions(options);
    let orig = _.clone(this._settingsCache);

    this._settingsCache = {};

    if (opts.shouldSave) {
      this._requestSave();
    }

    this._emitChangeEvent({
      changed: this._getChanged(orig, this._settingsCache)
    });
  }

  /**
   * Watches the chosen key path for changes. If a change is made to it's value,
   * the watch handler will be called.
   *
   * @param {string} keyPath
   * @param {Function} handler
   * @private
   */
  _watch(keyPath, handler) {
    if (this._validateKeyPath(keyPath), true) {
      this._addToWatchList(keyPath, handler);
    }
  }

  /**
   * Stops watching the chosen key path for changes.
   *
   * @param {string} keyPath
   * @private
   */
  _unwatch(keyPath) {
    if (this._validateKeyPath(keyPath), true) {
      this._removeFromWatchList(keyPath);
    }
  }

  /**
   * Adds a key path to our watch list.
   *
   * @param {string} key
   * @param {Function} value
   * @private
   */
  _addToWatchList(key, value) {
    debug('adding "' + key + '" to watch list');

    this._watchList.set(key, value);
  }

  /**
   * Removes a key path from our watch list.
   *
   * @param {string} keyPath
   * @private
   */
  _removeFromWatchList(key) {
    debug('removing ' + key + ' from watch list');

    this._watchList.delete(key);
  }

  /**
   * Parses and validates options passed into `set` or `unset`.
   *
   * @see _validateOptions
   * @param {Object} options
   * @returns {Object} opts
   * @private
   */
  _parseOptions(options) {
    let opts = _.defaults(options || {}, ElectronSettings.DefaultOptions);

    this._validateOptions(opts);

    return opts;
  }

  /**
   * Validates options, and throws if there is a problem.
   *
   * @param {Object} options
   * @private
   */
  _validateOptions(options) {
    if (!_.isBoolean(options.shouldSave)) {
      throw new TypeError(
        `"shouldSave" must be a boolean. Got "${typeof options.shouldSave}"`);
    }
  }

  /**
   * Validates that the given key path is valid. TODO more rigorous checks.
   *
   * @param {string} keyPath
   * @param {boolean} [throws=false]
   * @returns {boolean}
   * @private
   */
  _validateKeyPath(keyPath, throws) {
    if (keyPathHelpers.hasKeyPath(keyPath)) {
      return true;
    } else {
      if (throws) {
        throw new TypeError(
          `"keyPath" must be a string. Got "${typeof keyPath}"`);
      }

      return false;
    }
  }

  /**
   * Triggers the "ready" event.
   *
   * @private
   */
  _emitReadyEvent() {
    this.emit(ElectronSettings.Events.READY);
  }

  /**
   * Triggers the "change" event.
   *
   * @param {Object} obj
   * @private
   */
  _emitChangeEvent(obj) {
    this.emit(ElectronSettings.Events.CHANGE, obj);
  }

  /**
   * Triggers the "error" event.
   *
   * @param {Error} err
   * @private
   */
  _emitErrorEvent(err) {
    this.emit(ElectronSettings.Events.ERROR, err);
  }

  /**
   * Triggers the "save" event.
   *
   * @private
   */
  _emitSaveEvent() {
    this.emit(ElectronSettings.Events.SAVE);
  }

  /**
   * Gets the value of a setting at the chosen key path.
   *
   * @see _get
   * @param {string} keyPath
   * @returns {mixed}
   * @access public
   */
  get(keyPath) {
    return this._get.apply(this, arguments);
  }

  /**
   * Sets the value of a setting at the chosen key path, with options.
   *
   * @see _set
   * @param {string} keyPath
   * @param {mixed} value
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave]
   * @returns this
   * @access public
   */
  set(keyPath, value, options) {
    this._set.apply(this, arguments);

    return this;
  }

  /**
   * Unsets the value of a setting at the chosen key path, with options.
   *
   * @see _unset
   * @param {string} keyPath
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave]
   * @returns this
   * @access public
   */
  unset(keyPath, options) {
    this._unset.apply(this, arguments);

    return this;
  }

  /**
   * Erases all settings.
   *
   * @see _empty
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave]
   * @returns this
   * @access public
   */
  empty(options) {
    this._empty.apply(this, arguments);

    return this;
  }

  /**
   * Adds an event listener for the chosen event and applies the given callback.
   *
   * @param {string} eventName
   * @param {Function} callback
   * @returns this
   * @override EventEmitter.on
   * @access public
   */
  on(eventName, callback) {
    if (eventName in ElectronSettings.EventMap) {
      this.addListener(ElectronSettings.EventMap[eventName], callback);
    }

    return this;
  }

  /**
   * Removes an event listener from the chose event.
   *
   * @param {string} eventName
   * @param {Function} callback
   * @returns this
   * @override EventEmitter.off
   * @access public
   */
  off(eventName, callback) {
    if (eventName in ElectronSettings.EventMap) {
      this.removeListener(ElectronSettings.EventMap[eventName], callback);
    }

    return this;
  }

  /**
   * Watches the chosen key path for changes. If a change is made to it's value,
   * the watch handler will be called.
   *
   * @see _watch
   * @param {string} keyPath
   * @param {Function} handler
   * @returns this
   * @access public
   */
  watch(keyPath, handler) {
    this._watch.apply(this, arguments);

    return this;
  }

  /**
   * Stops watching the chosen key path for changes.
   *
   * @see _unwatch
   * @param {string} keyPath
   * @returns this
   * @access public
   */
  unwatch(keyPath) {
    this._unwatch.apply(this, arguments);

    return this;
  }

  /**
   * Gets the path to the config file.
   *
   * @returns {string}
   * @access public
   */
  getConfigFilePath() {
    return this._configFilePath;
  }

  /**
   * Gracefully destroys this ElectronSettings instance.
   *
   * @access public
   */
  destroy() {
    this._debouncedSave.cancel();

    this.off('change', this._onChange);
    this.off('error', this._onError);
    this.off('save', this._onSave);

    this.removeAllListeners();

    this._settingsCache = null;
    this._watchList = null;
    this._options = null;
    this._debouncedSave = null;
    this._onChange = null;
    this._onError = null;
    this._onSave = null;
    this._configFilePath = null;
  }

  /**
   * @returns {Object}
   * @access public
   */
  get cache() {
    return this._settingsCache;
  }
}

/**
 * @enum {mixed} Defaults
 * @description Default ElectronSettings instance options.
 */
ElectronSettings.Defaults = {
  configDirPath: DEFAULT_CONFIG_DIR_PATH,
  configFileName: DEFAULT_CONFIG_FILE_NAME,
  debounceSaveTime: DEFAULT_DEBOUNCE_SAVE_TIME
};

/**
 * @enum {mixed} DefaultOptions
 * @description Default `set` and `unset` options.
 */
ElectronSettings.DefaultOptions = {
  shouldSave: true
};

/**
 * @enum {string} Events
 */
ElectronSettings.Events = keyMirror({
  READY: null,
  CHANGE: null,
  ERROR: null,
  SAVE: null
});

/**
 * @enum {string} EventMap
 * @description Maps user-friendly event names to core events.
 * @see ElectronSettings.Events
 */
ElectronSettings.EventMap = {
  ready: ElectronSettings.Events.READY,
  change: ElectronSettings.Events.CHANGE,
  error: ElectronSettings.Events.ERROR,
  save: ElectronSettings.Events.SAVE
};

/**
 * @enum {string} ChangeActions
 */
ElectronSettings.ChangeActions = keyMirror({
  ARRAY: null,
  EDITED: null,
  DELETED: null,
  NEW: null
});

/**
 * @enum {string} ChangeActionsMap
 * @description Maps deep-diff `kind` values to core change actions.
 * @see ElectronSettings.ChangeActions
 */
ElectronSettings.ChangeActionsMap = {
  A: ElectronSettings.ChangeActions.ARRAY,
  E: ElectronSettings.ChangeActions.EDITED,
  D: ElectronSettings.ChangeActions.DELETED,
  N: ElectronSettings.ChangeActions.NEW
};

module.exports = ElectronSettings;
