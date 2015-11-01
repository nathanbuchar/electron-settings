/**
 * @fileoverview User data settings manager for Electron.
 * @author Nathan Buchar
 * @license ISC
 */

'use strict';

let _ = require('lodash');
let app = require('app');
let fs = require('fs-extra');
let keyMirror = require('key-mirror');
let path = require('path');
let util = require('util');

let EventEmitter = require('events').EventEmitter;

let keyPathHelpers = require('./key-path-helpers');

/**
 * Define key path helpers.
 */
let hasKeyPath = keyPathHelpers.hasKeyPath;
let getValueAtKeyPath = keyPathHelpers.getValueAtKeyPath;
let setValueAtKeyPath = keyPathHelpers.setValueAtKeyPath;
let deleteValueAtKeyPath = keyPathHelpers.deleteValueAtKeyPath;
let splitKeyPath = keyPathHelpers.splitKeyPath;
let pushKeyPath = keyPathHelpers.pushKeyPath;

/**
 * Configure debugger.
 */
let debug = require('debug')('electron-settings');

/**
 * Declare internals.
 */
let internals = {
  ElectronSettings: null
};

/**
 * ElectronSettings class constructor.
 *
 * @class ElectronSettings
 * @constructor
 */
module.exports = internals.ElectronSettings = function () {

  /**
   * @prop {Object} _settings
   * @private
   */
  this._settings = {};

  /**
   * @prop {boolean} _savePending
   * @default false
   * @private
   */
  this._savePending = false;

  /**
   * @prop {Object} _debouncedSave
   * @private
   */
  this._debouncedSave = _.debounce(this._save, 100);

  /**
   * @prop {string} _configDirPath
   * @private
   */
  this._configDirPath = app.getPath('userData');

  /**
   * @prop {string} _configFilePath
   * @private
   */
  this._configFilePath = path.join(this._configDirPath, 'config', 'settings.json');

  fs.ensureFileSync(this._configFilePath);
};

/**
 * Inherits from EventEmitter.
 */
util.inherits(internals.ElectronSettings, EventEmitter);

/**
 * Emits a change event.
 *
 * @private
 */
internals.ElectronSettings.prototype._emitChangeEvent = function () {
  debug('trigger `change` event');

  this.emit(internals.ElectronSettings.Events.CHANGE);
};

/**
 * Parses options.
 *
 * @param {Object} [options]
 * @returns {Object}
 * @private
 */
internals.ElectronSettings.prototype._parseOptions = function (options) {
  return _.assign(internals.ElectronSettings.DefaultOptions, options);
};

/**
 * Requests that we save the current settings state.
 *
 * @private
 */
internals.ElectronSettings.prototype._requestSave = function () {
  debug('save requested');

  this._savePending = true;
  this._debouncedSave.call(this);
};

/**
 * Saves the current settings state.
 *
 * @private
 */
internals.ElectronSettings.prototype._save = function () {
  debug('saving to disk');

  this._savePending = false;

  try {
    fs.writeJsonSync(this._configFilePath, this._settings);
  } catch (err) {
    console.log(err);
    debug('failed to save %s', path.basename(this._configFilePath));
  }
};

/**
 * Gets the string path to the config file being used.
 *
 * @returns {string}
 * @access public
 */
internals.ElectronSettings.prototype.getUserConfigPath = function () {
  return this._configFilePath;
};

/**
 * Sets the value of a configuration setting at the given key-path.
 *
 * @param {string} keyPath
 * @param {mixed} value
 * @param {Object} [options]
 * @access public
 */
internals.ElectronSettings.prototype.set = function (keyPath, value, options) {
  debug('setting %s to %s', keyPath, value);

  options = this._parseOptions(options);

  if (util.isString(keyPath)) {
    setValueAtKeyPath(this._settings, keyPath, value);
  } else if (util.isObject(keyPath)) {
    this._settings = keyPath;
  }

  if (options.shouldSave) {
    this._requestSave();
  }

  this._emitChangeEvent();
};

/**
 * Unsets a configuration setting at the given key-path.
 *
 * @param {string} keyPath
 * @param {Object} [options]
 * @access public
 */
internals.ElectronSettings.prototype.unset = function (keyPath, options) {
  debug('unsetting %s', keyPath);

  options = this._parseOptions(options);

  deleteValueAtKeyPath(this._settings, keyPath);

  if (options.shouldSave) {
    this._requestSave();
  }

  this._emitChangeEvent();
};

/**
 * Gets the value of a configuration setting at the given key-path.
 *
 * @param {string} keyPath
 * @returns {mixed}
 * @access public
 */
internals.ElectronSettings.prototype.get = function (keyPath) {
  return getValueAtKeyPath(this._settings, keyPath);
};

/**
 * Adds a change listener.
 *
 * @param {Function} callback
 */
internals.ElectronSettings.prototype.addChangeListener = function (callback) {
  this.addListener(internals.ElectronSettings.Events.CHANGE, callback);
};

/**
 * Removes a change listener.
 *
 * @param {Function} callback
 */
internals.ElectronSettings.prototype.removeChangeListener = function (callback) {
  this.removeListener(internals.ElectronSettings.Events.CHANGE, callback);
};

/**
 * @enum {mixed} DefaultOptions
 */
internals.ElectronSettings.DefaultOptions = {
  shouldSave: true
};

/**
 * @enum {string} Events
 */
internals.ElectronSettings.Events = keyMirror({
  CHANGE: null
});
