import electron from 'electron';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import {
  writeFile as writeFileAtomic,
  writeFileSync as writeFileAtomicSync,
} from 'atomically';
import _get from 'lodash.get';
import _has from 'lodash.has';
import _set from 'lodash.set';
import _unset from 'lodash.unset';

/**
 * At the basic level, a key path is the string equivalent
 * of dot notation in JavaScript. Take the following object,
 * for example:
 *
 *     const obj = {
 *       color: {
 *         name: 'cerulean',
 *         code: {
 *           rgb: [0, 179, 230],
 *           hex: '#003BE6'
 *         }
 *       }
 *     }
 *
 * You can access the value of the key `name` in plain
 * JavaScript by traversing the tree using object dot
 * notation, like so:
 *
 *     console.log(obj.color.name);
 *     // => "cerulean"
 *
 * Similarly in Electron Settings, you are reading and
 * writing to a JSON object in a file, and a key path is
 * just a string that points to a specific key within that
 * object -- essentially using object dot notation in
 * string form.
 *
 *     settings.get('color.name');
 *     // => "cerulean"
 *
 * Key paths need not be just strings. In fact, there are
 * perfectly valid use-cases where you might need to access
 * a key, but the name of the key is stored in some
 * variable. In this case, you can specify an array of
 * strings which can be flattened into a regular key path.
 *
 *     const h = 'hue';
 *     settings.get(['color', h]);
 *     // => undefined
 *
 * Additionally, since Electron Settings uses Lodash's
 * {@link https://lodash.com/docs/4.17.15#get|get()}
 * function under the hood, you can even use array syntax:
 *
 *     settings.get('color.code.rgb[1]');
 *     // => 179
 *
 * Using key paths, you are not limited to setting only
 * top-level keys like you would be with LocalStorage. With
 * Electron Settings, you can deeply nest properties like
 * you would with any other object in JavaScript, and it
 * just feels natural.
 */
type KeyPath = string | Array<string | number>;

/**
 * `SettingsValue` types are the datatypes supported by
 * Electron Settings. Since Electron Settings reads and
 * writes to a JSON file, any value you set must be a valid
 * JSON value. This does however mean that `Date` types are
 * _not_ supported.
 *
 * Either simply store a numeric unix timestamp using
 * `Date.now()`, or convert dates back into `Date` types
 * using `new Date()`:
 *
 *     await settings.set('user.lastLogin', new Date());
 *
 *     const lastLogin = await settings.get('user.lastLogin');
 *     const lastLoginDate = new Date(lastLogin);
 */
type SettingsValue = null | boolean | string | number | SettingsObject | SettingsValue[];

/**
 * A `SettingsObject` is an object whose property values
 * are of the type `SettingsValue`.
 */
type SettingsObject = {
  [key: string]: SettingsValue;
};

/**
 * `Config` types contain all the configuration options for
 * Electron Settings that can be set using
 * [[configure|configure()]].
 */
type Config = {

  /**
   * Whether or not to save the settings file atomically.
   */
  atomicSave: boolean;

  /**
   * The path to the settings directory. Defaults to your
   * app's user data direcory.
   */
  dir?: string;

  /**
   * A custom Electron instance to use. Great for testing!
   */
  electron?: typeof Electron;

  /**
   * The name of the settings file that will be saved to
   * the disk.
   */
  fileName: string;

  /**
   * The number of spaces to use when stringifying the data
   * before saving to disk if `prettify` is set to `true`.
   */
  numSpaces: number;

  /**
   * Whether or not to prettify the data when it's saved to
   * disk.
   */
  prettify: boolean;
};

/** @internal */
const defaultConfig: Config = {
  atomicSave: true,
  fileName: 'settings.json',
  numSpaces: 2,
  prettify: false,
};

/** @internal */
let config: Config = {
  ...defaultConfig,
};

/**
 * Returns the Electron instance. The developer may define
 * a custom Electron instance by using `configure()`.
 *
 * @returns The Electron instance.
 * @internal
 */
function getElectron(): typeof Electron {
  return config.electron ?? electron;
}

/**
 * Returns the Electron app. The app may need be accessed
 * via `Remote` depending on whether this code is running
 * in the main or renderer process.
 *
 * @returns The Electron app.
 * @internal
 */
function getElectronApp(): Electron.App {
  const e = getElectron();
  const app = e.app ?? e.remote.app;

  return app;
}

/**
 * Returns the path to the settings directory. The path
 * may be customized by the developer by using
 * `configure()`.
 *
 * @returns The path to the settings directory.
 * @internal
 */
function getSettingsDirPath(): string {
  return config.dir ?? getElectronApp().getPath('userData');
}

/**
 * Returns the path to the settings file. The file name
 * may be customized by the developer using `configure()`.
 *
 * @returns The path to the settings file.
 * @internal
 */
function getSettingsFilePath(): string {
  const dir = getSettingsDirPath();

  return path.join(dir, config.fileName);
}

/**
 * Ensures that the settings file exists. If it does not
 * exist, then it is created.
 *
 * @returns A promise which resolves when the settings file exists.
 * @internal
 */
function ensureSettingsFile(): Promise<void> {
  const filePath = getSettingsFilePath();

  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          saveSettings({}).then(resolve, reject);
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });
}

/**
 * Ensures that the settings file exists. If it does not
 * exist, then it is created.
 *
 * @internal
 */
function ensureSettingsFileSync(): void {
  const filePath = getSettingsFilePath();

  try {
    fs.statSync(filePath);
  } catch (err) {
    if (err) {
      if (err.code === 'ENOENT') {
        saveSettingsSync({});
      } else {
        throw err;
      }
    }
  }
}

/**
 * Ensures that the settings directory exists. If it does
 * not exist, then it is created.
 *
 * @returns A promise which resolves when the settings dir exists.
 * @internal
 */
function ensureSettingsDir(): Promise<void> {
  const dirPath = getSettingsDirPath();

  return new Promise((resolve, reject) => {
    fs.stat(dirPath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          mkdirp(dirPath).then(() => resolve(), reject);
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });
}

/**
 * Ensures that the settings directory exists. If it does
 * not exist, then it is created.
 *
 * @internal
 */
function ensureSettingsDirSync(): void {
  const dirPath = getSettingsDirPath();

  try {
    fs.statSync(dirPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      mkdirp.sync(dirPath);
    } else {
      throw err;
    }
  }
}

/**
 * First ensures that the settings file exists then loads
 * the settings from the disk.
 *
 * @returns A promise which resolves with the settings object.
 * @internal
 */
function loadSettings(): Promise<SettingsObject> {
  return ensureSettingsFile().then(() => {
    const filePath = getSettingsFilePath();

    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  });
}

/**
 * First ensures that the settings file exists then loads
 * the settings from the disk.
 *
 * @returns The settings object.
 * @internal
 */
function loadSettingsSync(): SettingsObject {
  const filePath = getSettingsFilePath();

  ensureSettingsFileSync();

  const data = fs.readFileSync(filePath, 'utf-8');

  return JSON.parse(data);
}

/**
 * Saves the settings to the disk.
 *
 * @param obj The settings object to save.
 * @returns A promise which resolves when the settings have been saved.
 * @internal
 */
function saveSettings(obj: SettingsObject): Promise<void> {
  return ensureSettingsDir().then(() => {
    const filePath = getSettingsFilePath();
    const numSpaces = config.prettify ? config.numSpaces : 0;
    const data = JSON.stringify(obj, null, numSpaces);

    return new Promise((resolve, reject) => {
      if (config.atomicSave) {
        writeFileAtomic(filePath, data, (err) => {
          return err
            ? reject(err)
            : resolve();
        });
      } else {
        fs.writeFile(filePath, data, (err) => {
          return err
            ? reject(err)
            : resolve();
        });
      }
    });
  });
}

/**
 * Saves the settings to the disk.
 *
 * @param obj The settings object to save.
 * @internal
 */
function saveSettingsSync(obj: SettingsObject): void {
  const filePath = getSettingsFilePath();
  const numSpaces = config.prettify ? config.numSpaces : 0;
  const data = JSON.stringify(obj, null, numSpaces);

  ensureSettingsDirSync();

  if (config.atomicSave) {
    writeFileAtomicSync(filePath, data);
  } else {
    fs.writeFileSync(filePath, data);
  }
}

/**
 * Returns the path to the settings file.
 *
 * In general, the settings file is stored in your app's
 * user data directory in a file called `settings.json`.
 * The default user data directory varies by system.
 *
 * - **macOS** - `~/Library/Application\ Support/<Your App>`
 * - **Windows** - `%APPDATA%/<Your App>`
 * - **Linux** - Either `$XDG_CONFIG_HOME/<Your App>` or
 * `~/.config/<Your App>`
 *
 * Although it is not recommended, you may change the name
 * or location of the settings file using
 * [[configure|configure()]].
 *
 * @returns The path to the settings file.
 * @example
 *
 * Get the path to the settings file.
 *
 *     settings.file();
 *     // => /home/nathan/.config/MyApp/settings.json
 */
function file(): string {
  return getSettingsFilePath();
}

/**
 * Sets the configuration for Electron Settings. To reset
 * to defaults, use [[reset|reset()]].
 *
 * Defaults:
 *
 *     {
 *       atomicSave: true,
 *       fileName: 'settings.json',
 *       numSpaces: 2,
 *       prettify: false
 *     }
 *
 * @param customConfig The custom configuration to use.
 * @example
 *
 * Update the filename to `cool-settings.json` and prettify
 * the output.
 *
 *     settings.configure({
 *       fileName: 'cool-settings.json',
 *       prettify: true
 *     });
 */
function configure(customConfig: Partial<Config>): void {
  config = { ...config, ...customConfig };
}

/**
 * Resets the Electron Settings configuration to defaults.
 *
 * @example
 *
 * Reset configuration to defaults.
 *
 *     settings.reset();
 */
function reset(): void {
  config = { ...defaultConfig };
}

/**
 * Checks if the given key path exists. For sync,
 * use [[hasSync|hasSync()]].
 *
 * @category Core
 * @param keyPath The key path to check.
 * @returns A promise which resolves to `true` if the
 * `keyPath` exists, else `false`.
 * @example
 *
 * Check if the value at `color.name` exists.
 *
 *     // Given:
 *     //
 *     // {
 *     //   "color": {
 *     //     "name": "cerulean",
 *     //     "code": {
 *     //       "rgb": [0, 179, 230],
 *     //       "hex": "#003BE6"
 *     //     }
 *     //   }
 *     // }
 *
 *     const exists = await settings.has('color.name');
 *     // => true
 *
 * @example
 *
 * Check if the value at `color.hue` exists.
 *
 *     const h = 'hue';
 *     const exists = await settings.has(['color', h]);
 *     // => false
 *
 *  @example
 *
 * Check if the value at `color.code.rgb[1]` exists.
 *
 *     const exists = await settings.has(color.code.rgb[1]);
 *     // => true
 */
async function has(keyPath: KeyPath): Promise<boolean> {
  const obj = await loadSettings();

  return _has(obj, keyPath);
}

/**
 * Checks if the given key path exists. For async,
 * use [[hasSync|hasSync()]].
 *
 * @category Core
 * @param keyPath The key path to check.
 * @returns `true` if the `keyPath` exists, else `false`.
 * @example
 *
 * Check if the value at `color.name` exists.
 *
 *     // Given:
 *     //
 *     // {
 *     //   "color": {
 *     //     "name": "cerulean",
 *     //     "code": {
 *     //       "rgb": [0, 179, 230],
 *     //       "hex": "#003BE6"
 *     //     }
 *     //   }
 *     // }
 *
 *     const exists = settings.hasSync('color.name');
 *     // => true
 *
 * @example
 *
 * Check if the value at `color.hue` exists.
 *
 *     const h = 'hue';
 *     const exists = settings.hasSync(['color', h]);
 *     // => false
 *
 * @example
 *
 * Check if the value at `color.code.rgb[1]` exists.
 *
 *     const exists = settings.hasSync(color.code.rgb[1]);
 *     // => true
 */
function hasSync(keyPath: KeyPath): boolean {
  const obj = loadSettingsSync();

  return _has(obj, keyPath);
}

/**
 * Gets all settings. For sync, use
 * [[getSync|getSync()]].
 *
 * @category Core
 * @returns A promise which resolves with all settings.
 * @example
 *
 * Gets all settings.
 *
 *     const obj = await get();
 */
async function get(): Promise<SettingsObject>;

/**
 * Gets the value at the given key path. For sync,
 * use [[getSync|getSync()]].
 *
 * @category Core
 * @param keyPath The key path of the property.
 * @returns A promise which resolves with the value at the
 * given key path.
 * @example
 *
 * Get the value at `color.name`.
 *
 *     // Given:
 *     //
 *     // {
 *     //   "color": {
 *     //     "name": "cerulean",
 *     //     "code": {
 *     //       "rgb": [0, 179, 230],
 *     //       "hex": "#003BE6"
 *     //     }
 *     //   }
 *     // }
 *
 *     const value = await settings.get('color.name');
 *     // => "cerulean"
 *
 * @example
 *
 * Get the value at `color.hue`.
 *
 *     const h = 'hue';
 *     const value = await settings.get(['color', h]);
 *     // => undefined
 *
 * @example
 *
 * Get the value at `color.code.rgb[1]`.
 *
 *     const h = 'hue';
 *     const value = await settings.get('color.code.rgb[1]');
 *     // => 179
 */
async function get(keyPath: KeyPath): Promise<SettingsValue>;

async function get(keyPath?: KeyPath): Promise<SettingsObject | SettingsValue> {
  const obj = await loadSettings();

  if (keyPath) {
    return _get(obj, keyPath);
  } else {
    return obj;
  }
}

/**
 * Gets all settings. For async, use [[get|get()]].
 *
 * @category Core
 * @returns All settings.
 * @example
 *
 * Gets all settings.
 *
 *     const obj = getSync();
 */
function getSync(): SettingsObject;

/**
 * Gets the value at the given key path. For async,
 * use [[get|get()]].
 *
 * @category Core
 * @param keyPath The key path of the property.
 * @returns The value at the given key path.
 * @example
 *
 * Get the value at `color.name`.
 *
 *     // Given:
 *     //
 *     // {
 *     //   "color": {
 *     //     "name": "cerulean",
 *     //     "code": {
 *     //       "rgb": [0, 179, 230],
 *     //       "hex": "#003BE6"
 *     //     }
 *     //   }
 *     // }
 *
 *     const value = settings.getSync('color.name');
 *     // => "cerulean"
 *
 * @example
 *
 * Get the value at `color.hue`.
 *
 *     const h = 'hue';
 *     const value = settings.getSync(['color', h]);
 *     // => undefined
 *
 * @example
 *
 * Get the value at `color.code.rgb[1]`.
 *
 *     const h = 'hue';
 *     const value = settings.getSync('color.code.rgb[1]');
 *     // => 179
 */
function getSync(keyPath: KeyPath): SettingsValue;

function getSync(keyPath?: KeyPath): SettingsValue {
  const obj = loadSettingsSync();

  if (keyPath) {
    return _get(obj, keyPath);
  } else {
    return obj;
  }
}

/**
 * Sets all settings. For sync, use [[setSync|setSync()]].
 *
 * @category Core
 * @param obj The new settings.
 * @returns A promise which resolves when the settings have
 * been set.
 * @example
 *
 * Set all settings.
 *
 *     await settings.set({ aqpw: 'nice' });
 */
async function set(obj: SettingsObject): Promise<void>;

/**
 * Sets the value at the given key path. For sync,
 * use [[setSync|setSync()]].
 *
 * @category Core
 * @param keyPath The key path of the property.
 * @param value The value to set.
 * @returns A promise which resolves when the setting has
 * been set.
 * @example
 *
 * Change the value at `color.name` to `sapphire`.
 *
 *     // Given:
 *     //
 *     // {
 *     //   "color": {
 *     //     "name": "cerulean",
 *     //     "code": {
 *     //       "rgb": [0, 179, 230],
 *     //       "hex": "#003BE6"
 *     //     }
 *     //   }
 *     // }
 *
 *     await settings.set('color.name', 'sapphire');
 *
 * @example
 *
 * Set the value of `color.hue` to `blue-ish`.
 *
 *     const h = 'hue';
 *     await settings.set(['color', h], 'blue-ish);
 *
 * @example
 *
 * Change the value of `color.code`.
 *
 *     await settings.set('color.code', {
 *       rgb: [16, 31, 134],
 *       hex: '#101F86'
 *     });
 */
async function set(keyPath: KeyPath, obj: SettingsValue): Promise<void>;

async function set(...args: [SettingsObject] | [KeyPath, SettingsValue]): Promise<void> {
  if (args.length === 1) {
    const [value] = args;

    return saveSettings(value);
  } else {
    const [keyPath, value] = args;
    const obj = await loadSettings();

    _set(obj, keyPath, value);

    return saveSettings(obj);
  }
}

/**
 * Sets all settings. For async, use [[set|set()]].
 *
 * @category Core
 * @param obj The new settings.
 * @example
 *
 * Set all settings.
 *
 *     settings.setSync({ aqpw: 'nice' });
 */
function setSync(obj: SettingsObject): void;

/**
 * Sets the value at the given key path. For async,
 * use [[set|set()]].
 *
 * @category Core
 * @param keyPath The key path of the property.
 * @param value The value to set.
 * @example
 *
 * Change the value at `color.name` to `sapphire`.
 *
 *     // Given:
 *     //
 *     // {
 *     //   "color": {
 *     //     "name": "cerulean",
 *     //     "code": {
 *     //       "rgb": [0, 179, 230],
 *     //       "hex": "#003BE6"
 *     //     }
 *     //   }
 *     // }
 *
 *     settings.setSync('color.name', 'sapphire');
 *
 * @example
 *
 * Set the value of `color.hue` to `blue-ish`.
 *
 *     const h = 'hue';
 *     settings.setSync(['color', h], 'blue-ish);
 *
 * @example
 *
 * Change the value of `color.code`.
 *
 *     settings.setSync('color.code', {
 *       rgb: [16, 31, 134],
 *       hex: '#101F86'
 *     });
 */
function setSync(keyPath: KeyPath, value: SettingsValue): void;

function setSync(...args: [SettingsObject] | [KeyPath, SettingsValue]): void {
  if (args.length === 1) {
    const [value] = args;

    saveSettingsSync(value);
  } else {
    const [keyPath, value] = args;
    const obj = loadSettingsSync();

    _set(obj, keyPath, value);

    saveSettingsSync(obj);
  }
}

/**
 * Unsets all settings. For sync, use [[unsetSync|unsetSync()]].
 *
 * @category Core
 * @returns A promise which resolves when the settings have
 * been unset.
 * @example
 *
 * Unsets all settings.
 *
 *     await settings.unset();
 */
async function unset(): Promise<void>;

/**
 * Unsets the property at the given key path. For sync,
 * use [[unsetSync|unsetSync()]].
 *
 * @category Core
 * @param keyPath The key path of the property.
 * @returns A promise which resolves when the setting has
 * been unset.
 * @example
 *
 * Unset the property `color.name`.
 *
 *     // Given:
 *     //
 *     // {
 *     //   "color": {
 *     //     "name": "cerulean",
 *     //     "code": {
 *     //       "rgb": [0, 179, 230],
 *     //       "hex": "#003BE6"
 *     //     }
 *     //   }
 *     // }
 *
 *     await settings.unset('color.name');
 *
 *     await settings.get('color.name');
 *     // => undefined
 *
 * @example
 *
 * Unset the property `color.code.rgba[1]`.
 *
 *     await settings.unset('color.code.rgba[1]');
 *
 *     await settings.get('color.code.rgb');
 *     // => [0, null, 230]
 */
async function unset(keyPath: KeyPath): Promise<void>;

async function unset(keyPath?: KeyPath): Promise<void> {
  if (keyPath) {
    const obj = await loadSettings();

    _unset(obj, keyPath);

    return saveSettings(obj);
  } else {
    // Unset all settings by saving empty object.
    return saveSettings({});
  }
}

/**
 * Unsets all settings. For async, use [[unset|unset()]].
 *
 * @category Core
 * @example
 *
 * Unsets all settings.
 *
 *     settings.unsetSync();
 */
function unsetSync(): void;

/**
 * Unsets the property at the given key path. For async,
 * use [[unset|unset()]].
 *
 * @category Core
 * @param keyPath The key path of the property.
 * @example
 *
 * Unset the property `color.name`.
 *
 *     // Given:
 *     //
 *     // {
 *     //   "color": {
 *     //     "name": "cerulean",
 *     //     "code": {
 *     //       "rgb": [0, 179, 230],
 *     //       "hex": "#003BE6"
 *     //     }
 *     //   }
 *     // }
 *
 *     settings.unsetSync('color.name');
 *
 *     settings.getSync('color.name');
 *     // => undefined
 *
 * @example
 *
 * Unset the property `color.code.rgba[1]`.
 *
 *     settings.unsetSync('color.code.rgba[1]');
 *
 *     settings.getSync('color.code.rgb');
 *     // => [0, null, 230]
 */
function unsetSync(keyPath: KeyPath): void;

function unsetSync(keyPath?: KeyPath): void {
  if (keyPath) {
    const obj = loadSettingsSync();

    _unset(obj, keyPath);

    saveSettingsSync(obj);
  } else {
    // Unset all settings by saving empty object.
    saveSettingsSync({});
  }
}

export = {
  file,
  configure,
  reset,
  has,
  hasSync,
  get,
  getSync,
  set,
  setSync,
  unset,
  unsetSync,
};
