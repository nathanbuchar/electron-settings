import {EventEmitter} from 'events'

declare module 'electron-settings' {
  interface ElectronSettingsOptions {
    /**
     * Whether electron-settings should create a tmp file during save to ensure
     * data-write consistency. Defaults to `true`.
     */
    atomicSaving?: boolean

    /**
     * Prettify the JSON output. Defaults to `false`.
     */
    prettify?: boolean
  }

  interface ApplyDefaultsOptions extends ElectronSettingsOptions {
    /**
     * Overwrite pre-existing settings with their respective default values.
     * Defaults to `false`.
     */
    overwrite?: boolean
  }

  class Observer {
    dispose (): void
  }

  class Settings extends EventEmitter {
    /**
     * Globally configures default options.
     */
    configure (options: ElectronSettingsOptions): void

    /**
     * Globally configures default settings.
     *
     * If the settings file has not been created yet, these defaults will be
     * applied, but only if `settings.defaults` is called before making any other
     * calls that interact with the file system, such as `has()`, `get()`, or
     * `set()`.
     */
    defaults (defaults: any): void

    /**
     * Returns a promise whose first argument is a boolean indicating if the key
     * path exists within the settings object. For synchronous operation, use
     * `hasSync()`.
     *
     * @param keyPath The path to the key that we wish to check exists within the
     *                settings object.
     */
    has (keyPath: string): PromiseLike<boolean>

    /**
     * The synchronous version of `has()`.
     *
     * @param keyPath The path to the key that we wish to check exists within the
     *                settings object.
     */
    hasSync (keyPath: string): boolean

    /**
     * Returns a promise whose first argument is the value at the chosen key path.
     * If no key path is chosen, the entire settings object will be returned
     * instead. For synchronous operation, use `getSync()`.
     *
     * @param keyPath The path to the key that we wish to get the value of.
     */
    get (keyPath?: string): PromiseLike<any>

    /**
     * The synchronous version of `get()`.
     *
     * @param keyPath The path to the key that we wish to get the value of.
     */
    getSync (keyPath?: string): any

    /**
     * Sets the value of the key at the chosen key path. For synchronous
     * operation, use `setSync()`.
     *
     * @param keyPath The path to the key whose value we wish to set. This key
     *                need not already exist.
     * @param value   The value to set the key at the chosen key path to. This
     *                must be a data type supported by JSON: object, array,
     *                string, number, boolean, or null.
     */
    set (keyPath: string, value: any, options?: ElectronSettingsOptions): PromiseLike<void>

    /**
     * The synchronous version of `set()`.
     * @param keyPath The path to the key whose value we wish to set. This key
     *                need not already exist.
     * @param value   The value to set the key at the chosen key path to. This
     *                must be a data type supported by JSON: object, array,
     *                string, number, boolean, or null.
     */
    setSync (keyPath: string, value: any, options?: ElectronSettingsOptions): void

    /**
     * Deletes the key and value at the chosen key path. To clear the entire
     * settings object, use `clear()`. For synchronous operation, use
     * `deleteSync()`.
     *
     * @param keyPath The path to the key we wish to unset.
     */
    delete (keyPath: String, options?: ElectronSettingsOptions): PromiseLike<void>

    /**
     * The synchronous version of `delete()`.
     *
     * @param keyPath The path to the key we wish to unset.
     */
    deleteSync (): void

    /**
     * Clears the entire settings object. For synchronous operation, use
     * `clearSync()`.
     */
    clear (options?: ElectronSettingsOptions): PromiseLike<void>

    /**
     * The synchronous verison of `clear()`.
     */
    clearSync (options?: ElectronSettingsOptions): void

    /**
     * Applies defaults to the current settings object (deep). Settings that
     * already exist will not be overwritten, but keys that exist within the
     * defaults that don't exist within the setting object will be added. To
     * configure defaults, use `defaults()`. For synchronous operation, use
     * `applyDefaultsSync()`.
     */
    applyDefaults (options?: ApplyDefaultsOptions): PromiseLike<void>

    /**
     * The synchronous version of `applyDefaults()`.
     */
    applyDefaultsSync (options?: ApplyDefaultsOptions): void

    /**
     * Resets all settings to defaults. To configure defaults, use `defaults()`.
     * For synchronous operation, use `resetToDefaultsSync()`.
     */
    resetToDefaults (options?: ElectronSettingsOptions): PromiseLike<void>

    /**
     * The synchronous version of `resetToDefaults()`.
     */
    resetToDefaultsSync (options?: ElectronSettingsOptions): void

    /**
     * Observes the chosen key path for changes and calls the handler if the value
     * changes. Returns an Observer instance which has a dispose method. To
     * unsubscribe, simply call `dispose()` on the returned key path observer.
     *
     * @param keyPath The path to the key that we wish to observe.
     * @param handler The callback that will be invoked if the value at the chosen
     *                key path changes.
     */
    observe (keyPath: string, handler: (evt: {oldValue: any, newValue: any}) => void): Observer

    /**
     * Returns the path to the config file. Typically found in your application's
     * user data directory:
     *
     * - `~/Library/Application Support/YourApp` on MacOS.
     * - `%APPDATA%/YourApp` on Windows.
     * - `$XDG_CONFIG_HOME/YourApp` or `~/.config/YourApp` on Linux.
     */
    getSettingsFilePath (): string

    /**
     * Emitted when the settings file has been created.
     */
    addListener (event: 'create', listener: (pathToSettings: string) => void): this
    emit (event: 'create', pathToSettings: string): boolean
    on (event: 'create', listener: (pathToSettings: string) => void): this
    once (event: 'create', listener: (pathToSettings: string) => void): this
    prependListener (event: 'create', listener: (pathToSettings: string) => void): this
    prependOnceListener (event: 'create', listener: (pathToSettings: string) => void): this
    removeListener (event: 'create', listener: (pathToSettings: string) => void): this

    /**
     * Emitted when the settings have been written to disk.
     */
    addListener (event: 'write', listener: () => void): this
    emit (event: 'write'): boolean
    on (event: 'write', listener: () => void): this
    once (event: 'write', listener: () => void): this
    prependListener (event: 'write', listener: () => void): this
    prependOnceListener (event: 'write', listener: () => void): this
    removeListener (event: 'write', listener: () => void): this
  }

  export default new Settings()
}
