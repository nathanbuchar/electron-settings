/**
 * @fileoverview ElectronSettings Watcher class definition.
 * @author Nathan Buchar
 */

'use strict';

let _ = require('lodash');
let array = require('ensure-array');

/**
 * Import Base.
 */
let Base = require('./base');

/**
 * Import key path helpers.
 */
let keyPathHelpers = require('./helpers');

/**
 * Configure debugger.
 */
let debug = require('debug')('electron-settings:watcher');

/**
 * @class Watcher
 * @extends Base
 */
class Watcher extends Base {

  /**
   * Watcher class constructor.
   *
   * @constructor
   */
  constructor() {
    super();

    /**
     * Watched key paths. The watched key path is the map key, and the watch
     * handler is the map value.
     *
     * @type Map
     * @private
     */
    this._watchList = new Map();
  }

  /**
   * Watches a key path or array of key paths and calls the handler function
   * when any are changed.
   *
   * @param {string|Array.<string>} keyPaths
   * @param {Function} handler
   * @private
   */
  _watch(keyPaths, handler) {
    _.each(array(keyPaths), keyPath => {
      if (keyPathHelpers.hasKeyPath(keyPath)) {
        this._addToWatchList(keyPath, handler);
      }
    });
  }

  /**
   * Removes a watcher or array of watchers defined with the given key path.
   *
   * @param {string|Array.<string>} keyPaths
   * @private
   */
  _unwatch(keyPaths) {
    _.each(array(keyPaths), keyPath => {
      if (keyPathHelpers.hasKeyPath(keyPath)) {
        this._removeFromWatchList(keyPath);
      }
    });
  }

  /**
   * Gets an array of watched key paths.
   *
   * @returns {Aray}
   * @private
   */
  _getWatchers() {
    return Array.from(this._watchList.keys());
  }

  /**
   * Clears all watched key paths.
   *
   * @private
   */
  _clearWatchers() {
    debug('cleared all watchers');

    this._watchList.clear();
  }

  /**
   * Adds a key path to our watch list.
   *
   * @param {string} key
   * @param {Function} value
   * @private
   */
  _addToWatchList(key, value) {
    debug('added "' + key + '" to watch list');

    this._watchList.set(key, value);
  }

  /**
   * Removes a key path from our watch list.
   *
   * @param {string} keyPath
   * @private
   */
  _removeFromWatchList(key) {
    debug('removed ' + key + ' from watch list');

    this._watchList.delete(key);
  }

  /**
   * Gracefully destroys this instance.
   *
   * @private
   */
  _destroy() {
    super._destroy();

    this._watchList.clear();
    this._watchList = null;
  }
}

module.exports = Watcher;
