Changelog
=========
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

***

1.1.0 - Jul. 11, 2016
---------------------
* Adds support for "change" event.
* Adds Kai Eichinger as a contributor.

1.0.4 - Apr. 14, 2016
---------------------
* Remove electron-prebuilt peer dependency. Fixes #11

1.0.3 - Apr. 05, 2016
---------------------
* Fix config path within renderer process. Fixes #9

1.0.0 - Feb. 12, 2016
---------------------
* Rewritten and more robust API.
* Changed all read and writes to asynchronous code.
* Introduced the "ElectronSettings.ready" event.
* Added the ability to specify the config directory, config file name, and debounced save time when creating a new ElectronSettings instance.
* Added the "ready", "change", "error", and "save" public events.
* `set()` will no longer accept an Object as the keyPath to set the root value. Use `set('.')` instead.
* Added `clear()` method to empty all settings.
* Added `on` and `off` for tying into public events.
* Added ability to watch a key path for changes.
* Added ability to specify a minimatch string as a key path when creating a watcher. This way you can watch "*" or "+(foo|*.bar)" for example.
* Implemented deep-diff to check for changes between two different settings states.
* Added a getter for the internal settings cache via `settings.cache`.
* Added a getter for the internal watchList via `settings.watchList`.

0.1.0 - Dec. 23, 2015
---------------------
* Syntactic compliance with Electron 0.36.0.
* `set`, `unset`, `addChangeListener`, and `removeChangeListener` now return a reference to the ElectronSettings instance. This will allow chaining of methods, such as `ElectronSettings.unset('foo').set('bar', 'baz')`.
* Added `electron-prebuilt@~0.36.0` as a peer dependency. Syntactic compliance with Electron 0.36.0 will break applications using older versions of Electron.
* Moving to 0.1.0 because of the breaking changes by syntactic compliance with Electron 0.36.0.
