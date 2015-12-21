# Changelog
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

***

0.0.2 - UNRELEASED
------------------
* Syntactic compliance with Electron 0.36.0.
* Added an `empty` method. When called, this will unset all settings.
* Added a `reset` method. When called, this will empty all settings and replace them with the desired Object.
* `set`, `unset`, `empty`, `reset`, `addChangeListener`, and `removeChangeListener` now return a reference to the ElectronSettings instance. This will allow chaining of methods, such as `ElectronSettings.unset('foo').set('bar', 'baz')`
