Changelog
=========
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

***

2.2.0 - Aug. 31, 2016
---------------------
* Improved internal debugger.
* Adds tests to test non-atomic saving.
* Adds tests for the `create` and `write` events.
* Add FSWatcher to trigger write events if the settings file is changed externally.
* Adds `options.settingsDir` and `options.settingsFileName` (needs tests).
* Updates dev dependencies.

2.1.1 - Aug. 3, 2016
--------------------
* Fixes syntax errors in README docs.
* Updates outdated dependencies.

2.1.0 - Aug. 2, 2016
--------------------
* Adds `defaults()`.
* Adds `applyDefaults()` and `applyDefaultsSync()`.
* Adds `resetToDefaults()` and `resetToDefaultsSync()`.
* Adds `util.assert` for parameter checks.
* Adds support for resetting the settings file if malformed JSON data is encountered.
* Removes `reset()` and `resetSync()` (breaking).
* Removes the option to omit the key path in `set()` and `setSync()`. A key path is now required (breaking).
* Removes the option to specify default settings via `configure()`.
* Fixes initial settings creation. Before it wouldn't apply default settings.
* Fixes Changelog.
* Updates Readme.

2.0.2 - Jul. 31, 2016
---------------------
* Fixes documentation links.
* Fixes Changelog.

2.0.1 - Jul. 31, 2016
---------------------
* Fixes documentation links.
* Updates Changelog.
* Updates .npmignore.
* Removes .github folder.

2.0.0 - Jul. 31, 2016
---------------------
* Adds `has()` method.
* Adds `configure()` method.
* Adds `reset()` method.
* Adds `delete()` method.
* Adds `observe()` method.
* Adds synchronous counterparts for all relevant methods.
* Adds atomic saving support.
* Adds Atom's official key-path-helpers package as a dependency.
* Adds the ability to set the root object using `set()` without a key path.
* Adds tests for all methods.
* Adds support for automatic testing with Travis.
* Adds ability to prettify JSON output.
* Removes `unset()` method.
* Removes `watch()` method.
* Removes `unwatch()` method.
* Removes `getWatchers()` methods.
* Removes `clearWatchers()` methods.
* Removes `destroy()` method.
* Removes the `"error"` event.
* Removes Lodash as a dependency.
* Removes caching layer and "save request" methodology present in Atom/config.
* Removes need to instantiate an ElectronSettings object.
* Removes key path watcher bloat, observers will now only return the old value and new value.

1.1.1 - Jul. 12, 2016
---------------------
* Fixes internal `'create'` event handler bug.

1.1.0 - Jul. 11, 2016
---------------------
* Adds support for `'change'` event.
* Adds Kai Eichinger as a contributor.

1.0.4 - Apr. 14, 2016
---------------------
* Remove `electron-prebuilt` peer dependency. Fixes #11

1.0.3 - Apr. 05, 2016
---------------------
* Fix config path within renderer process. Fixes #9

1.0.0 - Feb. 12, 2016
---------------------
* Changes all read and writes to asynchronous code.
* Adds the `ready` event.
* Adds the ability to specify the config directory, config file name, and debounced save time when creating a new ElectronSettings instance.
* Adds the `ready`, `change`, `error`, and `save` public events.
* `set()` will no longer accept an Object as the keyPath to set the root value. Use `set('.')` instead.
* Adds `clear()` method to empty all settings.
* Adds `on` and `off` for tying into public events.
* Adds ability to watch a key path for changes.
* Adds ability to specify a minimatch string as a key path when creating a watcher. This way you can watch "\*" or "+(foo|\*.bar)" for example.
* Implements deep-diff to check for changes between two different settings states.
* Adds a getter for the internal settings cache via `settings.cache`.
* Adds a getter for the internal watchList via `settings.watchList`.

0.1.0 - Dec. 23, 2015
---------------------
* Syntactic compliance with Electron 0.36.0.
* `set`, `unset`, `addChangeListener`, and `removeChangeListener` now return a reference to the ElectronSettings instance. This will allow chaining of methods, such as `ElectronSettings.unset('foo').set('bar', 'baz')`.
* Adds `electron-prebuilt@~0.36.0` as a peer dependency. Syntactic compliance with Electron 0.36.0 will break applications using older versions of Electron.
* Moving to 0.1.0 because of the breaking changes by syntactic compliance with Electron 0.36.0.
