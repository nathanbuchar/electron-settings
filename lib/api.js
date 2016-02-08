/**
 * @fileoverview ElectronSettings public API.
 * @author Nathan Buchar
 */

'use strict';

let Settings = require('./settings');

/**
 * @class Api
 * @extends Settings
 */
class Api extends Settings {

  /**
   * Gets the value of a setting at the chosen key path.
   *
   * @see Settings._get
   * @returns {mixed}
   * @access public
   */
  get() {
    return this._get.apply(this, arguments);
  }

  /**
   * Sets the value of a setting at the chosen key path, with options.
   *
   * @see Settings._set
   * @returns this
   * @access public
   */
  set() {
    this._set.apply(this, arguments);

    return this;
  }

  /**
   * Unsets the value of a setting at the chosen key path, with options.
   *
   * @see Settings._unset
   * @returns this
   * @access public
   */
  unset() {
    this._unset.apply(this, arguments);

    return this;
  }

  /**
   * Erases all settings.
   *
   * @see Settings._clear
   * @returns this
   * @access public
   */
  clear() {
    this._clear.apply(this, arguments);

    return this;
  }

  /**
   * Watches a key path or array of key paths and calls the handler function
   * when any are changed.
   *
   * @see Watcher._watch
   * @returns this
   * @access public
   */
  watch() {
    this._watch.apply(this, arguments);

    return this;
  }

  /**
   * Removes a watcher or array of watchers defined with the given key path.
   *
   * @see Watcher._unwatch
   * @returns this
   * @access public
   */
  unwatch() {
    this._unwatch.apply(this, arguments);

    return this;
  }

  /**
   * Gets an array of watched key paths.
   *
   * @see Watcher._getWatchers
   * @returns {Array}
   * @access public
   */
  getWatchers() {
    return this._getWatchers.apply(this, arguments);
  }

  /**
   * Clears all key path watchers.
   *
   * @see Watcher._clearWatchers
   * @returns this
   * @access public
   */
  clearWatchers() {
    this._clearWatchers.apply(this, arguments);

    return this;
  }

  /**
   * Alias for `removeListener`.
   *
   * @see Base._off
   * @alias EventEmitter.removeListener
   * @returns
   */
  off() {
    return this._off.apply(this, arguments);
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
   * @see Settings._destroy
   * @access public
   */
  destroy() {
    this._destroy.apply(this, arguments);
  }

  /**
   * @returns {Object}
   * @access public
   */
  get cache() {
    return this._settingsCache;
  }

  /**
   * @returns {Map}
   * @access public
   */
  get watchList() {
    return this._watchList;
  }
}

module.exports = Api;
