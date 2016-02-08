/**
 * @fileoverview ElectronSettings Base class definition.
 * @author Nathan Buchar
 */

'use strict';

let EventEmitter = require('events').EventEmitter;

/**
 * @class Base
 * @extends EventEmitter
 */
class Base extends EventEmitter {

  /**
   * Alias for `removeListener`.
   *
   * @alias EventEmitter.removeListener
   * @returns
   */
  _off(event, listener) {
    return this.removeListener(event, listener);
  }

  /**
   * Gracefully destroys this instance.
   *
   * @private
   */
  _destroy() {}
}

module.exports = Base;
