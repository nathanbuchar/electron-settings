'use strict';

const clone = require('clone');
const equal = require('deep-equal');

class Observer {

  /**
   * Creates a new observer instance.
   *
   * @param {Settings} settings
   * @param {string} keyPath
   * @param {Function} handler
   */
  constructor(settings, keyPath, handler) {

    /**
     * Reference to the settings instance.
     *
    * @type Settings
    * @private
     */
    this._settings = settings;

    /**
     * The observed key path.
     *
     * @type string
     * @private
     */
    this._keyPath = keyPath;

    /**
     * The change handler.
     *
     * @type Function
     * @private
     */
    this._handler = handler;

    /**
     * The current value of the key path.
     *
     * @type any
     * @default null
     * @private
     */
    this._currentValue = this._settings.getSync(keyPath);

    /**
     * Called when the settings file is written.
     *
     * @type Function
     * @private
     */
    this._handleWrite = this._onWrite.bind(this);

    return this._init();
  }

  /**
   * Initializes the key path observer.
   *
   * @returns {Object} this
   * @private
   */
  _init() {
    this._settings.on('write', this._handleWrite);

    return this;
  }

  /**
   * Called when the settings fileis written.
   *
   * @private
   */
  _onWrite() {
    const oldValue = this._currentValue;
    const newValue = this._settings.getSync(this._keyPath);

    if (!equal(newValue, oldValue)) {
      this._currentValue = clone(newValue);
      this._handler.call(this, {
        oldValue,
        newValue
      });
    }
  }

  /**
   * Disposes of the key path observer.
   */
  dispose() {
    this._settings.off('write', this._handleWrite);

    this._settings = null;
    this._keyPath = null;
    this._handler = null;
    this._currentValue = null;
    this._handleWrite = null;
  }
}

module.exports = Observer;
