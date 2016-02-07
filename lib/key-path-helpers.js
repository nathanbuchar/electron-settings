/**
 * @fileoverview Key-path helpers. Adapted from atom/key-path-helpers.
 * @see {@link https://github.com/atom/key-path-helpers}
 */

'use strict';

/**
 * @const {RegExp} ESCAPED_DOT
 * @description Regular expression definition for an escaped dot.
 */
const ESCAPED_DOT = /\\\./g;

/**
 * @const {RegExp} ANY_DOT
 * @description Regular expression defition of any dot.
 */
const ANY_DOT = /\./g;

/**
 * Determine if the given key-path is valid for the given object.
 *
 * @param {Object} object
 * @param {string} keyPath
 * @returns {boolean}
 */
function hasKeyPath(object, keyPath) {
  let keys = splitKeyPath(keyPath);

  for (let i = 0, len = keys.length; i < len; i++) {
    let key = keys[i];

    if (object == null || !object.hasOwnProperty(key)) {
      return false;
    }

    object = object[key];
  }

  return true;
}

/**
 * Gets the value of the given object at the given key-path.
 *
 * @param {Object} object
 * @param {string} keyPath
 * @returns {Object} object
 */
function getValueAtKeyPath(object, keyPath) {
  if (!keyPath) {
    return object;
  }

  let keys = splitKeyPath(keyPath);

  if (keyPath !== '.') {
    for (let i = 0, len = keys.length; i < len; i++) {
      let key = keys[i];

      object = object[key];

      if (object == null) {
        return object;
      }
    }
  }

  return object;
}

/**
 * Sets the value of a given object at the given key-path.
 *
 * @param {Object} object
 * @param {string} keyPath
 * @param {mixed} value
 */
function setValueAtKeyPath(object, keyPath, value) {
  let keys = splitKeyPath(keyPath);

  while (keys.length > 1) {
    let key = keys.shift();

    if (object[key] == null) {
      object[key] = {};
    }

    object = object[key];
  }

  object[keys.shift()] = value;
}

/**
 * Deletes the value of a given object at a given key-path.
 *
 * @param {Object} object
 * @param {string} keyPath
 */
function deleteValueAtKeyPath(object, keyPath) {
  let keys = splitKeyPath(keyPath);

  while (keys.length > 1) {
    let key = keys.shift();

    if (object[key] == null) {
      return;
    }

    object = object[key];
  }

  delete object[keys.shift()];
}

/**
 * Splits a key-path into an array, delimited by dots.
 *
 * @param {string} keyPath
 * @returns {Array} keyPathArray
 */
function splitKeyPath(keyPath) {
  if (keyPath == null) {
    return [];
  }

  let startIndex = 0;
  let keyPathArray = [];

  for (let i = 0, len = keyPath.length; i < len; i++) {
    let char = keyPath[i];

    if (char === '.' && (i === 0 || keyPath[i - 1] !== '\\')) {
      keyPathArray.push(
        keyPath.substring(startIndex, i).replace(ESCAPED_DOT, '.'));
      startIndex = i + 1;
    }
  }

  keyPathArray.push(
    keyPath.substr(startIndex, keyPath.length).replace(ESCAPED_DOT, '.'));

  return keyPathArray;
}

/**
 * Appends a given key to a given key-path.
 *
 * @param {string} keyPath
 * @param {string} key
 * @returns {string}
 */
function pushKeyPath(keyPath, key) {
  key = key.replace(ANY_DOT, '\\.');

  if (keyPath && keyPath.length > 0) {
    return keyPath + '.' + key;
  } else {
    return key;
  }
}

module.exports = {
  hasKeyPath: hasKeyPath,
  getValueAtKeyPath: getValueAtKeyPath,
  setValueAtKeyPath: setValueAtKeyPath,
  deleteValueAtKeyPath: deleteValueAtKeyPath,
  splitKeyPath: splitKeyPath,
  pushKeyPath: pushKeyPath
};
