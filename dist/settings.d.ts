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
declare type KeyPath = string | Array<string | number>;
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
declare type SettingsValue = null | boolean | string | number | SettingsObject | SettingsValue[];
/**
 * A `SettingsObject` is an object whose property values
 * are of the type `SettingsValue`.
 */
declare type SettingsObject = {
    [key: string]: SettingsValue;
};
/**
 * `Config` types contain all the configuration options for
 * Electron Settings that can be set using
 * [[configure|configure()]].
 */
declare type Config = {
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
/**
 * Initializes the Electron Settings in the main process.
 * Throws an error if you try to call it in renderer process.
 *
 * @example
 *
 *     settings.init();
 */
declare function init(): void;
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
declare function file(): string;
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
declare function configure(customConfig: Partial<Config>): void;
/**
 * Resets the Electron Settings configuration to defaults.
 *
 * @example
 *
 * Reset configuration to defaults.
 *
 *     settings.reset();
 */
declare function reset(): void;
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
declare function has(keyPath: KeyPath): Promise<boolean>;
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
declare function hasSync(keyPath: KeyPath): boolean;
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
declare function get(): Promise<SettingsObject>;
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
declare function get(keyPath: KeyPath): Promise<SettingsValue>;
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
declare function getSync(): SettingsObject;
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
declare function getSync(keyPath: KeyPath): SettingsValue;
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
declare function set(obj: SettingsObject): Promise<void>;
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
declare function set(keyPath: KeyPath, obj: SettingsValue): Promise<void>;
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
declare function setSync(obj: SettingsObject): void;
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
declare function setSync(keyPath: KeyPath, value: SettingsValue): void;
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
declare function unset(): Promise<void>;
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
declare function unset(keyPath: KeyPath): Promise<void>;
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
declare function unsetSync(): void;
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
declare function unsetSync(keyPath: KeyPath): void;
declare const _default: {
    init: typeof init;
    file: typeof file;
    configure: typeof configure;
    reset: typeof reset;
    has: typeof has;
    hasSync: typeof hasSync;
    get: typeof get;
    getSync: typeof getSync;
    set: typeof set;
    setSync: typeof setSync;
    unset: typeof unset;
    unsetSync: typeof unsetSync;
};
export = _default;
