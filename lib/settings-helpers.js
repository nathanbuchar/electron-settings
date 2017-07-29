/**
 * A module that contains key path helpers. Adapted from atom/key-path-helpers.
 *
 * @module settings-helpers
 * @author Nathan Buchar
 * @copyright 2016-2017 Nathan Buchar <hello@nathanbuchar.com>
 * @license ISC
 */

/**
 * Tests if the provided path represents the root path.
 * @param keyPath {string|string[]} path to a key
 * @return {boolean} true for the root path, false otherwise
 */
module.exports.isRootPath = keyPath => {
  /* Nicely work for both string and array
   * A proper version would test if array or string */
  return keyPath.length == 0;
}

/**
 * Converts the given key path into the various keys to call on an object
 * @param {string|string[]} keyPath
 * @return {string[]} keys along the path
 */
const resolvePath = keyPath => {
  if (Array.isArray(keyPath)) {
    // Make a defensive copy to pop and push into the path
    return keyPath.slice();
  } else {
    // We split the string according to '.', but not for escaped dots '\\.'
    return keyPath.match(/(\\.|[^.])+/g)
      .map(part => part.replace(/\\\./g, '.'));
  }
};
// Exported for tests
module.exports._resolvePath = resolvePath;

/**
 * Checks if the given object contains the given key path.
 *
 * @param {Object} obj
 * @param {string} keyPath
 * @returns {boolean}
 */
module.exports.hasKeyPath = (obj, keyPath) => {
  const keys = resolvePath(keyPath);

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];

    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      obj = obj[key];
    } else {
      return false;
    }
  }

  return true;
};

/**
 * Gets the value of the given object at the given key path.
 *
 * @param {Object} obj
 * @param {string} keyPath
 * @returns {any}
 */
module.exports.getValueAtKeyPath = (obj, keyPath) => {
  const keys = resolvePath(keyPath);

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];

    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      obj = obj[key];
    } else {
      return undefined;
    }
  }

  return obj;
};

/**
 * Sets the value of the given object at the given key path.
 *
 * @param {Object} obj
 * @param {string} keyPath
 * @param {any} value
 */
module.exports.setValueAtKeyPath = (obj, keyPath, value) => {
  const keys = resolvePath(keyPath);

  while (keys.length > 1) {
    const key = keys.shift();

    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      obj[key] = {};
    }

    obj = obj[key];
  }

  obj[keys.shift()] = value;
};

/**
 * Deletes the value of the given object at the given key path.
 *
 * @param {Object} obj
 * @param {string} keyPath
 */
module.exports.deleteValueAtKeyPath = (obj, keyPath) => {
  const keys = resolvePath(keyPath);

  while (keys.length > 1) {
    const key = keys.shift();

    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      return;
    }

    obj = obj[key];
  }

  delete obj[keys.shift()];
};
