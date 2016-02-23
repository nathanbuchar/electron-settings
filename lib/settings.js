/**
 * @fileoverview ElectronSettings Settings class definition.
 * @author Nathan Buchar
 */

'use strict';

const _ = require('lodash');
const deepDiff = require('deep-diff');
const fs = require('fs-extra');
const keyMirror = require('key-mirror');
const minimatch = require('minimatch');
const path = require('path');

/**
 * Import Watcher.
 */
const Watcher = require('./watcher');

/**
 * Import key path helpers.
 */
const keyPathHelpers = require('./helpers');

/**
 * Configure debugger.
 */
const debug = require('debug')('electron-settings:settings');

/**
 * @class Settings
 * @extends Watcher
 */
class Settings extends Watcher {

  /**
   * Settings class constructor.
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
     * @default null
     * @private
     */
    this._settingsCache = null;

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
    this._debouncedSave = null;

    /**
     * The full path to the config file.
     *
     * @type {string}
     * @default null
     * @private
     */
    this._configFilePath = null;

    /**
     * Internal change event handler.
     *
     * @see _handleChange
     * @type {Function}
     * @private
     */
    this._onChange = this._handleChange.bind(this);

    /**
     * Internal save event handler.
     *
     * @see _handleSave
     * @type {Function}
     * @private
     */
    this._onSave = this._handleSave.bind(this);

    /**
     * Internal error event handler.
     *
     * @see _handleError
     * @type {Function}
     * @private
     */
    this._onError = this._handleError.bind(this);

    this._init(options);
  }

  /**
   * Initialize the Settings instance.
   *
   * @param {Object} options
   * @private
   */
  _init(options) {
    this._setupOptions(options);
    this._setupSaveDebouncer();
    this._setupConfigFile();
    this._setupInternalCache();
    this._setupInternalEventBindings();
  }

  /**
   * Gets the default config directory for this ElectronSettings instance.
   * Supports older versions of Electron and test environments.
   *
   * @param {Object} options
   * @returns {string}
   * @private
   */
  _setupOptions(options) {
    this._options = _.defaults(options || {}, Settings.Defaults);

    if (!this._options.configDirPath) {
      this._options.configDirPath = this._getConfigDirPath();
    }
  }

  /**
   * Sets up the save debouncer.
   *
   * @private
   */
  _setupSaveDebouncer() {
    this._debouncedSave = _.debounce(
      this._save,
      this._options.debouncedSaveTime,
      {
        maxWait: 1000
      }
    );
  }

  /**
   * Ensures that the config file exists. If the file does not exist, it is
   * created and an empty Object is written.
   *
   * @private
   */
  _setupConfigFile() {
    let configDirPath = this._options.configDirPath;
    let configFileName = this._options.configFileName;
    let configFilePath = path.join(configDirPath, configFileName + '.json');

    try {
      fs.readFileSync(configFilePath);

      debug('found config file at ' + configFilePath);
    } catch (err) {
      debug('no config file found at ' + configFilePath);

      fs.outputJsonSync(configFilePath, {});

      debug('config file generated at ' + configFilePath);
    }

    this._configFilePath = configFilePath;
  }

  /**
   * Reads the config file and caches the data internally.
   *
   * @returns {Promise}
   * @private
   */
  _setupInternalCache() {
    let contents = fs.readFileSync(this._configFilePath);

    try {
      this._settingsCache = JSON.parse(contents);
    } catch (err) {
      throw new Error('malformed settings data at ' + this._configFilePath);
    }
  }

  /**
   * Sets up internal event bindings.
   *
   * @private
   */
  _setupInternalEventBindings() {
    this.on(Settings.Events.CHANGE, this._onChange);
    this.on(Settings.Events.SAVE, this._onSave);
    this.on(Settings.Events.ERROR, this._onError);
  }

  /**
   * Called when the "change" event fires. This checks the watch list for any
   * watched keys and calls their respective watch handlers if the changed key
   * paths match.
   *
   * @param {Object} data
   * @param {Object[]} data.changed
   * @private
   */
  _handleChange(data) {
    debug('change detected with data ' + JSON.stringify(data));

    this.watchList.forEach((watchHandler, watchKeyPath) => {
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
   * Requests the Settings instance to save the internal settings cache
   * to disk. A request is made so that if debouncing is active, the request can
   * be properly throttled.
   *
   * @see _save
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
  _save() {
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
   * Gets the value of a setting at the chosen key path.
   *
   * @param {string} keyPath
   * @returns {mixed}
   * @private
   */
  _get(keyPath) {
    if (_.isUndefined(keyPath) || keyPath === '.') {
      return this._settingsCache;
    } else if (keyPathHelpers.hasKeyPath(keyPath)) {
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
    } else if (keyPathHelpers.hasKeyPath(keyPath)) {
      keyPathHelpers.setValueAtKeyPath(this._settingsCache, keyPath, value);
    }

    if (opts.shouldSave) {
      this._requestSave();
    }

    this._emitChangeEvent({
      changed: this._getDifferences(orig, this._settingsCache)
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
      this._settingsCache = {};
    } else if (keyPathHelpers.hasKeyPath(keyPath)) {
      keyPathHelpers.deleteValueAtKeyPath(this._settingsCache, keyPath);
    }

    if (opts.shouldSave) {
      this._requestSave();
    }

    this._emitChangeEvent({
      changed: this._getDifferences(orig, this._settingsCache)
    });
  }

  /**
   * Erases all settings.
   *
   * @param {Object} [options]
   * @param {boolean} [options.shouldSave]
   * @private
   */
  _clear(options) {
    this._unset('.', options);
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
    let opts = _.defaults(options || {}, Settings.DefaultOptions);

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
   * Gets an Array of changed items between two objects. Utilizes deep-diff.
   *
   * @see _parseDifferences
   * @see _compileDifferences
   * @see {@link https://npmjs.org/package/deep-diff}
   * @param {Object} before
   * @param {Object} after
   * @returns {Object[]} differences
   * @private
   */
  _getDifferences(before, after) {
    let differences = deepDiff.diff(before, after);

    differences = this._parseDifferences(differences);
    differences = this._compileDifferences(differences);

    return differences;
  }

  /**
   * Parses the deep-diff differences array into a more friendly and
   * Settings-scoped format.
   *
   * @param {Object[]} differences
   * @returns {Object[]}
   * @private
   */
  _parseDifferences(differences) {
    return _.map(differences, difference => {
      let diff = {};
      let keyPathBase = _.last(difference.path);
      let isEditedArray = _.isNumber(keyPathBase);

      diff.action = Settings.ChangeActionsMap[difference.kind];

      if (isEditedArray) {
        diff.item = {};

        diff.index = keyPathBase;
        diff.action = Settings.ChangeActions.ARRAY;
        diff.keyPath = difference.path.slice(0, difference.path.length - 1).join('.');

        diff.item.action = Settings.ChangeActionsMap[difference.kind];

        // Rewrite `lhs` to `item.was`, if it exists.
        if (difference.lhs) {
          diff.item.was = difference.lhs;
        }

        // Rewrite `rhs` to `item.now`, if it exists.
        if (difference.rhs) {
          diff.item.now = difference.rhs;
        }
      } else if (diff.action === Settings.ChangeActions.ARRAY) {
        diff.item = {};

        diff.index = difference.index;
        diff.keyPath = difference.path.join('.');

        diff.item.action = Settings.ChangeActionsMap[difference.item.kind];

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
   * @param {Object[]} differences
   * @returns {Object[]} diffs
   * @private
   */
  _compileDifferences(differences) {
    let diffs = [];

    _.forEach(differences, difference => {
      if (difference.action !== Settings.ChangeActions.ARRAY) {
        diffs.push(difference);
      } else {
        let index = _.findIndex(diffs, { keyPath: difference.keyPath });
        let item = _.cloneDeep(difference.item);

        item.index = difference.index;

        if (index >= 0) {
          diffs[index].items.push(item);
        } else {
          diffs.push({
            action: Settings.ChangeActions.ARRAY,
            keyPath: difference.keyPath,
            items: [item]
          });
        }
      }
    });

    return diffs;
  }

  /**
   * Gets the default config directory for this ElectronSettings instance.
   * Supports older versions of Electron and test environments.
   *
   * @returns {string}
   * @private
   */
  _getConfigDirPath() {
    try {
      let app = require('electron').app || require('app');
      let userDataPath = app.getPath('userData');

      return path.join(userDataPath, 'electron-settings');
    } catch (err) {
      return path.join(__dirname, 'electron-settings');
    }
  }

  /**
   * Triggers the "change" event.
   *
   * @emits ElectronSettings#change
   * @param {Object} obj
   * @param {Object[]} obj.changed
   * @private
   */
  _emitChangeEvent(obj) {
    this.emit(Settings.Events.CHANGE, obj);
  }

  /**
   * Triggers the "error" event.
   *
   * @emits ElectronSettings#error
   * @param {Error} err
   * @private
   */
  _emitErrorEvent(err) {
    this.emit(Settings.Events.ERROR, err);
  }

  /**
   * Triggers the "save" event.
   *
   * @emits ElectronSettings#save
   * @private
   */
  _emitSaveEvent() {
    this.emit(Settings.Events.SAVE);
  }

  /**
   * Gracefully destroys this ElectronSettings instance.
   *
   * @private
   */
  _destroy() {
    this._debouncedSave.cancel();

    this.removeListener(Settings.Events.CHANGE, this._onChange);
    this.removeListener(Settings.Events.SAVE, this._onSave);
    this.removeListener(Settings.Events.ERROR, this._onError);

    this.removeAllListeners();

    this._settingsCache = null;
    this._options = null;
    this._debouncedSave = null;
    this._onChange = null;
    this._onError = null;
    this._onSave = null;
    this._configFilePath = null;
  }
}

/**
 * ElectronSettings default instance options.
 *
 * @type {mixed}
 * @readonly
 */
Settings.Defaults = {
  configDirPath: null,
  configFileName: 'settings',
  debouncedSaveTime: 100
};

/**
 * ElectronSettings default options.
 *
 * @type {boolean}
 * @readonly
 */
Settings.DefaultOptions = {
  shouldSave: true
};

/**
 * ElectronSettings event names.
 *
 * @type {string}
 * @readonly
 */
Settings.Events = {
  CHANGE: 'change',
  ERROR: 'error',
  SAVE: 'save'
};

/**
 * ElectronSettings change actions.
 *
 * @type {string}
 * @readonly
 */
Settings.ChangeActions = keyMirror({
  ARRAY: null,
  EDITED: null,
  DELETED: null,
  NEW: null
});

/**
 * ElectronSettings deep-diff change actions map.
 *
 * @type {string}
 * @readonly
 */
Settings.ChangeActionsMap = {
  A: Settings.ChangeActions.ARRAY,
  E: Settings.ChangeActions.EDITED,
  D: Settings.ChangeActions.DELETED,
  N: Settings.ChangeActions.NEW
};

module.exports = Settings;
