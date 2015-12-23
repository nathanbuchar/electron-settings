# Changelog
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

***

0.1.0 - UNRELEASED
------------------
* Syntactic compliance with Electron 0.36.0.
* `set`, `unset`, `addChangeListener`, and `removeChangeListener` now return a reference to the ElectronSettings instance. This will allow chaining of methods, such as `ElectronSettings.unset('foo').set('bar', 'baz')`
* Added `electron-prebuilt@~0.36.0` as a peer dependency. Syntactic compliance with Electron 0.36.0 will break applications using older versions of Electron.
* Moving to 0.1.0 because of the breaking changes by syntactic compliance with Electron 0.36.0.
