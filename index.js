/**
 * Electron Settings
 *
 * A simple persistent user settings manager for Electron. Originally adapted
 * from Atom's own configuration manager, electron-settings allows you to save
 * user settings to the disk so that they can be loaded in the next time your
 * app starts up.
 *
 * NOTE: v2 is not compatible with earlier versions of electron-settings.
 *
 * @version 2.2.2
 * @author Nathan Buchar
 * @copyright 2016 Nathan Buchar <hello@nathanbuchar.com>
 * @license ISC
 */

module.exports = require('./lib/settings');
