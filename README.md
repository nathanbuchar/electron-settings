# electron-settings

A simple persistent user settings manager for [Electron][external_electron].

Originally adapted from Atom's own configuration manager, electron-settings allows you to save your users' settings to the disk so that they can be loaded in the next time your app starts without skipping a beat.

Also, you can [subscribe to settings and get notified when their value changes][section_methods_watch]. So that's pretty neat.

[![npm version](https://badge.fury.io/js/electron-settings.svg)](http://badge.fury.io/js/electron-settings)
[![dependencies](https://david-dm.org/nathanbuchar/electron-settings.svg)](https://david-dm.org/nathanbuchar/electron-settings)
[![Build Status](https://travis-ci.org/nathanbuchar/electron-settings.svg?branch=master)](https://travis-ci.org/nathanbuchar/electron-settings)
[![Join the chat at https://gitter.im/nathanbuchar/electron-settings](https://badges.gitter.im/nathanbuchar/electron-settings.svg)](https://gitter.im/nathanbuchar/electron-settings?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)



***



## Install

```
$ npm install --save electron-settings
```


## Demo

```js
const settings = require('electron-settings');

settings.set('name', {
  first: 'Cosmo',
  last: 'Kramer'
});

settings.get('name.first');
// => "Cosmo"

settings.has('name.middle');
// => false
```


## FAQ

* **What is a "key path"?**

    With electron-settings, you are not just setting keys like you would with local storage. Instead, you are working with a JSON object, and a key path is a string that points to a specific key within that object—essentially using object dot notation in string form.

    For example, in the JSON object below the value at the key path `"foo.bar"` is `"baz"`.

    ```json
    {
      "foo": {
        "bar": "baz"
      }
    }
    ```

* **What data types may be stored?**

    You may set a key path to any value supported by JSON: an object, array, string, number, boolean, or `null`. Unfortunately, dates and other special object types will be type converted and lost, because JSON does not support anything other than the aforementioned data types.

* **Where is the settings file saved?**

    The file name for the settings is `settings` and it is saved in your app's [user data directory](http://electron.atom.io/docs/api/app/#appgetpathname) in a folder named `Config`.

    * `~/Library/Application Support/YourApp` on MacOS.
    * `%APPDATA%/YourApp` on Windows.
    * `$XDG_CONFIG_HOME/YourApp` or `~/.config/YourApp` on Linux.

* **Can I use electron-settings in both the main and renderer processes?**

    You bet!



***



## Methods

* [`has()`][section_methods_has]
* [`get()`][section_methods_get]
* [`getAll()`][section_methods_get-all]
* [`set()`][section_methods_set]
* [`setAll()`][section_methods_set-all]
* [`delete()`][section_methods_delete]
* [`deleteAll()`][section_methods_delete-all]
* [`watch()`][section_methods_watch]


***


* ### has()

    **`settings.has(keyPath):boolean`**

    Returns a boolean indicating whether the settings object contains the given key path.

    ***

    **Parameters**

    * **`keyPath`** *String*

    ***

    **Examples**

    Given:
    ```json
    {
      "foo": {
        "bar": "baz"
      }
    }
    ```

    Checks if the settings contains the key path `"foo.bar"`.
    ```js
    settings.has('foo.bar');
    // => true
    ```

    Checks if the settings contains the key path `"qux"`.
    ```js
    settings.has('qux');
    // => false
    ```


* ### get()

    **`settings.get(keyPath[, defaultValue]):any`**

    Returns the value at the given key path, or sets the value at that key path to the default value, if provided, if the key does not exist. See also: [`getAll()`][section_methods_get-all].

    ***

    **Parameters**

    * **`keyPath`** *String*
    * **`defaultValue`** *Any* - The value to apply if the setting does not already exist.

    ***

    **Examples**

    Given:
    ```json
    {
      "foo": {
        "bar": "baz"
      }
    }
    ```

    Gets the value at `"foo"`.
    ```js
    settings.get('foo');
    // => { "bar": "baz" }
    ```

    Gets the value at `"foo.bar"`.
    ```js
    settings.get('foo.bar');
    // => "baz"
    ```

    Gets the value at `"qux"`.
    ```js
    settings.get('qux');
    // => undefined
    ```

    Gets the value at `"qux"`, with a default fallback.
    ```js
    settings.get('qux', 'aqpw');
    // => "aqpw"
    ```


* ### getAll()

    **`settings.getAll():Object`**

    Returns all settings. See also: [`get()`][section_methods_get].

    ***

    **Examples**

    Given:
    ```json
    {
      "foo": {
        "bar": "baz"
      }
    }
    ```

    Gets all settings.
    ```js
    settings.getAll();
    // => { "foo": { "bar": "baz" } }
    ```


* ### set()

    **`settings.set(keyPath, value[, options])`**

    Sets the value at the given key path. See also: [`setAll()`][section_methods_set-all].

    ***

    **Parameters**

    * **`keyPath`** *String* - The path to the key whose value we wish to set. This key need not already exist.
    * **`value`** *Any* - The value to set the key at the chosen key path to. This must be a data type supported by JSON: an object, array, string, number, boolean, or `null`.
    * **`options`** *Object* (optional)
      * `prettify` *Boolean* (optional) - Prettify the JSON output. Defaults to `false`.

    ***

    **Examples**

    Given:
    ```json
    {
      "foo": {
        "bar": "baz"
      }
    }
    ```

    Changing the value at the key path `"foo.bar"` from `"baz"` to `"qux"`.
    ```js
    settings.set('foo.bar', 'qux');

    settings.get('foo.bar');
    // => "qux"
    ```

    Setting the value at the key path `"new.key"`.
    ```js
    settings.set('new', 'hotness');

    settings.get('new');
    // => "hotness"
    ```


* ### setAll()

    **`settings.setAll(obj[, options])`**

    Sets all settings. See also: [`set()`][section_methods_set].

    ***

    **Parameters**

    * **`obj`** *Object* - The new settings object.
    * **`options`** *Object* (optional)
      * `prettify` *Boolean* (optional) - Prettify the JSON output. Defaults to `false`.

    ***

    **Examples**

    Given:
    ```json
    {
      "foo": {
        "bar": "baz"
      }
    }
    ```

    Sets all settings.
    ```js
    settings.setAll({ new: 'hotness' });

    settings.getAll();
    // => { "new": "hotness" }
    ```


* ### delete()

    **`settings.delete(keyPath[, options])`**

    Deletes the key and value at the given key path. See also: [`deleteAll()`][section_methods_delete-all].

    ***

    **Parameters**

    * **`keyPath`** *String*
    * **`options`** *Object* (optional)
      * `prettify` *Boolean* (optional) - Prettify the JSON output. Defaults to `false`.

    ***

    **Examples**

    Given:
    ```json
    {
      "foo": {
        "bar": "baz"
      }
    }
    ```

    Deleting `"foo.bar"`.
    ```js
    settings.delete('foo.bar');

    settings.get('foo');
    // => {}
    ```


* ### deleteAll()

    **`settings.deleteAll([options])`**

    Deletes all settings. See also: [`delete()`][section_methods_delete].

    ***

    **Examples**

    Given:
    ```json
    {
      "foo": {
        "bar": "baz"
      }
    }
    ```

    Deletes all settings.
    ```js
    settings.deleteAll();

    settings.getAll();
    // => {}
    ```


* ### watch()

    **`settings.watch(keyPath, handler):Function`**

    Watches the given key path for changes and calls the given handler if the value changes. To unsubscribe from changes, call `dispose()` on the Observer instance that is returned.

    ***

    **Parameters**

    * **`keyPath`** *String* - The path to the key that we wish to watch for changes.
    * **`handler`** *Function* - The callback that will be invoked if the value at the chosen key path changes. Passes the following as arguments:
      * `newValue` *Any*
      * `oldValue` *Any*

    ***

    **Examples**

    Given:
    ```json
    {
      "foo": {
        "bar": "baz"
      }
    }
    ```

    Watch `"foo.bar"`.
    ```js
    settings.watch('foo', (newValue, oldValue) => {
      console.log(newValue);
      // => "qux"
    });

    settings.set('foo.bar', 'qux');
    ```

    Dispose the key path watcher after the value has changed once.
    ```js
    const observer = settings.watch('foo', newValue => {
      observer.dispose();
    });

    settings.set('foo', 'qux');
    });
    ```



## Authors
* [Nathan Buchar] (Owner)


## License
[ISC][license]


***
**Having trouble?** [Get help on Gitter][external_gitter].</small>






[license]: ./LICENSE.md

[Nathan Buchar]: mailto:hello@nathanbuchar.com

[section_install]: #install
[section_demo]: #demo
[section_faq]: #faq
[section_methods]: #methods
[section_authors]: #authors
[section_license]: #license

[section_methods_has]: #has
[section_methods_get]: #get
[section_methods_get-all]: #getall
[section_methods_set]: #set
[section_methods_set-all]: #setall
[section_methods_delete]: #delete
[section_methods_delete-all]: #deleteall
[section_methods_watch]: #watch

[external_electron]: https://electron.atom.io
[external_gitter]: https://gitter.im/nathanbuchar/electron-settings
