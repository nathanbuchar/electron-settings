/**
 * A module that delegates settings changes.
 *
 * @module settings-observer
 * @author Nathan Buchar
 * @copyright 2016-2017 Nathan Buchar <hello@nathanbuchar.com>
 * @license ISC
 */
const winston = require('winston');
const _ = require('lodash');

class SettingsObserver {

  constructor(settings, keyPath, handler, currentValue) {

    /**
     * A reference to the Settings instance.
     *
     * @type {Settings}
     * @private
     */
    this._settings = settings;

    /**
     * The key path that this observer instance is watching for changes.
     *
     * @type {string}
     * @private
     */
    this._keyPath = keyPath;

    /**
     * The handler function to be called when the value at the observed
     * key path is changed.
     *
     * @type {Function}
     * @private
     */
    this._handler = handler;

    /**
     * The current value of the setting at the given key path.
     *
     * @type {any}
     * @private
     */
    this._currentValue = currentValue;
  }

  get keyPath() {
    return this._keyPath;
  }

  get handler() {
    return this._handler;
  }

  onChange() {
    try {
      const newVal = _.get(this._settings._cacheObj, this._keyPath);
      const oldVal = this._currentValue;
      if (!_.isEqual(newVal, oldVal)) {
        this._currentValue = newVal;
        this._handler.call(this, newVal, oldVal);
      }
    } catch (e) {
      winston.error(e);
    }
  }

  /**
   * Disposes of this key path observer.
   *
   * @public
   */
  dispose() {
    this._settings._watchHandlers = _.reject(this._settings._watchHandlers, n => n === this);
  }
}

module.exports = SettingsObserver;
