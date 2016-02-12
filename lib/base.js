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
class Base extends EventEmitter {}

module.exports = Base;
