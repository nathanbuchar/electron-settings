ElectronSettings
================

Save settings to a disk and load them in when your app starts. A user settings manager for Electron, adapted from [Atom/config](https://github.com/atom/atom/blob/master/src/config.coffee).

**Requires Electron 0.35.0 or above.**



***



Usage
-----

**`new ElectronSettings([options])`**

**Arguments**

* **`options`** *(Object)* - Custom options for this `ElectronSettings` instance.

  * `options.configDirPath` *(string)* - Absolute path to the directory where you'd like to save your settings.json file. By default this is in your user data directory. See `app.getPath('userData')`.

  * `options.configFileName` *(string)* - The file name for your settings file. By default this is `settings`. Omit the `.json` extension.

  * `options.debouncedSaveTime` *(number)* - The maximum amount of time in milliseconds that must elapse before saving to disk. Default `100`


**Example**

To use `electron-settings`, first import the class, then create a new `electron-settings` instance:

```js
const ElectronSettings = require('electron-settings');

let settings = new ElectronSettings();

console.log(settings.getConfigFilePath());
// => /Users/Nathan/Library/Application Support/Electron/electron-settings/settings.json
```

This will automatically generate a settings.json file in your user data directory if one does not exist. If the file already exists, it will be imported.


***


Documentation
-------------

* [Methods][docs_methods]
* [Events][docs_events]
* *More coming soon*


Authors
-------
* [Nathan Buchar](mailto:hello@nathanbuchar.com)


License
-------
MIT




[docs_methods]: ./docs/api/methods.md
[docs_events]: ./docs/api/events.md
