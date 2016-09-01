electron-settings
=================

A simple persistent user settings manager for [Electron][external_electron]. Originally adapted from [Atom's own configuration manager][external_atom-config], electron-settings allows you to save user settings to the disk so that they can be loaded in the next time your app starts.

Also, you can [observe key paths][method_observe] and get notified if their value changes. So that's pretty neat.

**Note:** v2 is not compatible with earlier versions of electron-settings.

[![npm version](https://badge.fury.io/js/electron-settings.svg)](http://badge.fury.io/js/electron-settings)
[![dependencies](https://david-dm.org/nathanbuchar/electron-settings.svg)](https://david-dm.org/nathanbuchar/electron-settings)
[![Build Status](https://travis-ci.org/nathanbuchar/electron-settings.svg?branch=master)](https://travis-ci.org/nathanbuchar/electron-settings)
[![Join the chat at https://gitter.im/nathanbuchar/electron-settings](https://badges.gitter.im/nathanbuchar/electron-settings.svg)](https://gitter.im/nathanbuchar/electron-settings?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)



***



Install
---------

```
$ npm install electron-settings
```


Quick Start
-----------

```js
const settings = require('electron-settings');

settings.set('name', {
  first: 'Cosmo',
  last: 'Kramer'
}).then(() => {
  settings.get('name.first').then(val => {
    console.log(val);
    // => "Cosmo"
  });
});

settings.getSettingsFilePath();
// => /Users/You/Library/Application Support/YourApp/Settings
```


Default Settings
----------------

You can configure default settings by using [`settings.defaults()`][method_defaults]. This will set the defaults object globally. If this is the first time the settings file is being accessed, the defaults will be applied automatically.

```js
settings.defaults({
  foo: 'bar'
});

settings.get('foo').then(val => {
  console.log(val);
  // => 'bar'
});
```

Additionally, you can use [`applyDefaults()`][method_apply-defaults] or [`resetToDefaults()`][method_reset-to-defaults] to fit your needs.



FAQ
---

* **What is a "key path"?**

  With electron-settings, you are not just setting keys like you would with local storage. Instead, you are working with a JSON object, and a key path is a string that points to a specific key within that object—essentially object dot notation in string form.

  For example, in the JSON object below the value at the key path `"foo.bar"` is `"baz"`.

  ```json
  {
    "foo": {
      "bar": "baz"
    }
  }
  ```

* **Can I use electron-settings in both the main and renderer processes?**

  Yes! Just be aware that if the window closes during an async operation, data may be lost.

* **What data types may be stored?**

  You may set a key path to any value supported by JSON: an object, array, string, number, boolean, or `null`.

* **Why do I have to use promises?**

  electron-settings reads and writes to the file system asynchronously. In order to ensure data integrity, you should use promises. Alternatively, all methods have a synchronous counterpart that you may use instead.

* **Where is the settings file saved?**

  The settings file is named `Settings` and is saved in your app's [user data directory](http://electron.atom.io/docs/api/app/#appgetpathname):

    * `~/Library/Application Support/YourApp` on MacOS.
    * `%APPDATA%/YourApp` on Windows.
    * `$XDG_CONFIG_HOME/YourApp` or `~/.config/YourApp` on Linux.

  You can use [`getSettingsFilePath()`][method_get-settings-file-path] to get the full path to the settings file.



***



Documentation
-------------
* [Events][docs_events]
* [Methods][docs_methods]


Contributors
-------
* [Nathan Buchar](mailto:hello@nathanbuchar.com) (Owner)
* [Kai Eichinger](mailto:kai.eichinger@outlook.com)
* *You?*


License
-------
[ISC][license]


***
<small>Last updated **Aug. 16th, 2016** by [Nathan Buchar].</small>

<small>**Having trouble?** [Get help on Gitter][external_gitter].</small>






[license]: ./LICENSE.md

[Nathan Buchar]: mailto:hello@nathanbuchar.com

[section_install]: #install
[section_quick-start]: #quick-start
[section_default-settings]: #default-settings
[section_faq]: #faq
[section_documentation]: #documentation
[section_contributors]: #contributors
[section_license]: #license

[docs_events]: ./docs/events.md
[docs_methods]: ./docs/methods.md

[method_get-settings-file-path]: ./docs/methods.md#getsettingsfilepath
[method_observe]: ./docs/methods.md#observe
[method_defaults]: ./docs/methods.md#defaults
[method_apply-defaults]: ./docs/methods.md#applydefaults
[method_reset-to-defaults]: ./docs/methods.md#resettodefaults

[external_electron]: https://electron.atom.com
[external_atom-config]: https://github.com/atom/atom/blob/master/src/config.coffee
[external_gitter]: https://gitter.im/nathanbuchar/electron-settings
