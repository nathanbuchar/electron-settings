/**
 * A module that delegates settings changes.
 *
 * @module settings-observer
 * @author Nathan Buchar
 * @copyright 2016-2017 Nathan Buchar <hello@nathanbuchar.com>
 * @license ISC
 */

const assert = require('assert');

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

    /**
     * Called when the settings file is changed.
     *
     * @type {Object}
     * @private
     */
    this._handleChange = this._onChange.bind(this);

    this._init();
  }

  /**
   * Initializes this instance.
   *
   * @private
   */
  _init() {
    this._settings.on('change', this._handleChange);
  }

  /**
   * Called when the settings file is changed.
   *
   * @private
   */
  _onChange() {
    const oldValue = this._currentValue;
    const newValue = this._settings.get(this._keyPath);

    try {
      assert.deepEqual(newValue, oldValue);
    } catch (err) {
      this._currentValue = newValue;

      // Call the watch handler and pass in the new and old values.
      this._handler.call(this, newValue, oldValue);
    }
  }

  /**
   * Disposes of this key path observer.
   *
   * @public
   */
  dispose() {
    this._settings.removeListener('change', this._handleChange);
  }
}

module.exports = SettingsObserver;
