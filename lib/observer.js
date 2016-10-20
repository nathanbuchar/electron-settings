'use strict';

const clone = require('clone');
const debug = require('debug')('electron-settings:observer');
const deepEqual = require('deep-equal');

class Observer {

  /**
   * Creates a new observer instance.
   *
   * @param {Settings} settings
   * @param {string} keyPath
   * @param {Function} handler
   * @returns {Object}
   */
  constructor(settings, keyPath, handler) {

    debug(`new key path observer for "${keyPath}"`);

    /**
     * Reference to the settings instance.
     *
    * @type {Settings}
    * @private
     */
    this._settings = settings;

    /**
     * The observed key path.
     *
     * @type {string}
     * @private
     */
    this._keyPath = keyPath;

    /**
     * The change handler.
     *
     * @type {Function}
     * @private
     */
    this._handler = handler;

    /**
     * The current value of the key path.
     *
     * @type {*}
     * @default null
     * @private
     */
    this._currentValue = this._getCurrentValue();

    /**
     * Called when the settings file is written.
     *
     * @type {Function}
     * @private
     */
    this._handleSettingsWrite = this._onSettingsChange.bind(this);

    /**
     * Bind write listener.
     */
    this._settings.on('_write', this._handleSettingsWrite);

    return this;
  }

  /**
   * Returns the current value of the observed key path.
   *
   * @returns {*}
   * @private
   */
  _getCurrentValue() {
    const settings = this._settings;
    const keyPath = this._keyPath;
    const value = settings.getSync(keyPath);

    return value;
  }

  /**
   * Called when the settings fileis written.
   *
   * @private
   */
  _onSettingsChange() {
    const oldValue = this._currentValue;
    const newValue = this._getCurrentValue();

    if (!deepEqual(newValue, oldValue)) {
      debug(`detected change at "${this._keyPath}"`);

      this._currentValue = clone(newValue);
      this._handler.call(this, {
        oldValue,
        newValue
      });
    }
  }

  /**
   * Disposes of the key path observer by unbinding the event listener and
   * nullifying all internal references.
   */
  dispose() {
    const keyPath = this._keyPath;

    this._settings.removeListener('_write', this._handleSettingsWrite);
    this._settings = null;
    this._keyPath = null;
    this._handler = null;
    this._currentValue = null;
    this._handleSettingsWrite = null;

    debug(`key path observer for "${keyPath}" disposed`);
  }
}

module.exports = Observer;
