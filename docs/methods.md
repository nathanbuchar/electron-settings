[Electron Settings] » **Methods**


***


Methods
=======

* [`configure()`][method_configure]
* [`defaults()`][method_defaults]
* [`has()`][method_has] [*sync*][method_has-sync]
* [`get()`][method_get] [*sync*][method_get-sync]
* [`set()`][method_set] [*sync*][method_set-sync]
* [`delete()`][method_delete] [*sync*][method_delete-sync]
* [`clear()`][method_clear] [*sync*][method_clear-sync]
* [`applyDefaults()`][method_apply-defaults] [*sync*][method_apply-defaults-sync]
* [`resetToDefaults()`][method_reset-to-defaults] [*sync*][method_reset-to-defaults-sync]
* [`observe()`][method_observe]
* [`getSettingsFilePath()`][method_get-settings-file-path]



***


configure()
-----------

**`settings.configure(options)`**

Globally configures default options.

**Arguments**

* **`options`** *Object*
  * `atomicSaving` *Boolean* (optional) - Whether electron-settings should create a tmp file during save to ensure data-write consistency. Defaults to `true`.
  * `prettify` *Boolean* (optional) - Prettify the JSON output. Defaults to `false`.


**Examples**

Always prettify output unless otherwise stated.
```js
settings.configure({
  prettify: true
});

// Output will be prettified.
settings.setSync('foo', 'bar');

// Output will not be prettified.
settings.setSync('foo', 'bar', { prettify: false });
```


***


defaults()
----------

**`settings.defaults(defaults)`**

Globally configures default settings.

If the settings file has not been created yet, these defaults will be applied, but only if `settings.defaults` is called *before* making any other calls that interact with the file system, such as `has()`, `get()`, or `set()`.

**Arguments**
  * **`defaults`** *Object* - The defaults object.

**Examples**

Set default settings for when the settings file is created for the first time.
```js
settings.defaults({
  name: {
    first: 'Joe',
    last: 'Defacto'
  }
});

settings.get('name.first').then(val => {
  console.log(val);
  // => Joe
});
```


***


has()
-----

**`settings.has(keyPath):Promise`**

Returns a promise whose first argument is a boolean indicating if the key path exists within the settings object. For synchronous operation, use [`hasSync()`][method_has-sync].

**Arguments**

  * **`keyPath`** *String* - The path to the key that we wish to check exists within the settings object.

**Examples**

Given:
```json
{
  "foo": {
    "bar": "baz"
  }
}
```

Check if `"foo.bar"` exists.
```js
settings.has('foo.bar').then(exists => {
  console.log(exists);
  // => true
});
```

Check if `"grizzknuckle"` exists.
```js
settings.has('grizzknuckle').then(exists => {
  console.log(exists);
  // => false
});
```


***


hasSync()
---------

**`settings.hasSync(keyPath):boolean`**

The synchronous version of [`has()`][method_has].

**Examples**

Given:
```json
{
  "foo": {
    "bar": "baz"
  }
}
```

Check if `"foo.bar"` exists.
```js
settings.hasSync('foo.bar');
// => true
```

Check if `"grizzknuckle"` exists.
```js
settings.hasSync('grizzknuckle');
// => false
```


***


get()
-----

**`settings.get([keyPath]):Promise`**

 Returns a promise whose first argument is the value at the chosen key path. If no key path is chosen, the entire settings object will be returned instead. For synchronous operation, use [`getSync()`][method_get-sync].

**Arguments**

  * **`keyPath`** *String* (optional) - The path to the key that we wish to get the value of.

**Examples**

Given:
```json
{
  "foo": {
    "bar": "baz"
  }
}
```

Get all settings.
```js
settings.get().then(val => {
  console.log(val);
  // => { foo: { bar: 'baz' } }
});
```

Get the value at `"foo.bar"`.
```js
settings.get('foo.bar').then(val => {
  console.log(val);
  // => 'baz'
});
```

Get the value at `"snap"`.
```js
settings.get('snap').then(val => {
  console.log(val);
  // => undefined
});
```

***


getSync()
---------

**`settings.getSync([keyPath]):any`**

 The synchronous version of [`get()`][method_get].

**Examples**

Given:
```json
{
  "foo": {
    "bar": "baz"
  }
}
```

Get all settings.
```js
settings.getSync();
// => { foo: { bar: 'baz' } }
```

Get the value at `"foo.bar"`.
```js
settings.getSync('foo.bar');
// => 'baz'
```

Get the value at `"snap"`.
```js
settings.getSync('snap');
// => undefined
```

***


set()
-----

**`settings.set(keyPath, value[, options]):Promise`**

Sets the value of the key at the chosen key path. For synchronous operation, use [`setSync()`][method_set-sync].

**Arguments**

  * **`keyPath`** *String* - The path to the key whose value we wish to set. This key need not already exist.
  * **`value`** *Any* - The value to set the key at the chosen key path to. This must be a data type supported by JSON: object, array, string, number, boolean, or `null`.
  * **`options`** *Object* (optional)
    * `atomicSaving` *Boolean* (optional) - Whether electron-settings should create a tmp file during save to ensure data-write consistency. Defaults to `true`.
    * `prettify` *Boolean* (optional) - Prettify the JSON output. Defaults to `false`.

**Examples**

Given:
```json
{}
```

Set the `"user.name"` key path to an object.
```js
settings.set('user.name', {
  first: 'Cosmo',
  last: 'Kramer'
}).then(() => {
  settings.get('user.name.first').then(val => {
    console.log(val);
    // => 'Cosmo'
  });
});
```


***


setSync()
---------

**`settings.setSync(keyPath, value[, options])`**

The synchronous version of [`set()`][method_set].

**Examples**

Given:
```json
{}
```

Set the `"user.name"` key path to an object.
```js
settings.setSync('user.name', {
  first: 'Cosmo',
  last: 'Kramer'
});

settings.getSync('user.name.first');
// => 'Cosmo'
```


***


delete()
--------

**`settings.delete(keyPath[, options]):Promise`**

Deletes the key and value at the chosen key path. To clear the entire settings object, use [`clear()`][method_clear]. For synchronous operation, use [`deleteSync()`][method_delete-sync].

**Arguments**

  * **`keyPath`** *String* - The path to the key we wish to unset.
  * **`options`** *Object* (optional)
    * `atomicSaving` *Boolean* (optional) - Whether electron-settings should create a tmp file during save to ensure data-write consistency. Defaults to `true`.
    * `prettify` *Boolean* (optional) - Prettify the JSON output. Defaults to `false`.

**Examples**

Given:
```json
{
  "foo": {
    "bar": "baz"
  }
}
```

Delete `"foo.bar"`.
```js
settings.delete('foo.bar').then(() => {
  settings.get('foo').then(val => {
    console.log(val);
    // => { foo: {} }
  });
});
```


***


deleteSync()
------------

**`settings.deleteSync(keyPath[, options])`**

The synchronous version of [`delete()`][method_delete].


***


clear()
-------

**`settings.clear([options]):Promise`**

Clears the entire settings object. For synchronous operation, use [`clearSync()`][method_clear-sync].

**Arguments**

  * **`options`** *Object* (optional)
    * `atomicSaving` *Boolean* (optional) - Whether electron-settings should create a tmp file during save to ensure data-write consistency. Defaults to `true`.
    * `prettify` *Boolean* (optional) - Prettify the JSON output. Defaults to `false`.

**Examples**

Given:
```json
{
  "foo": {
    "bar": "baz"
  }
}
```

Clear all settings.
```js
settings.clear(() => {
  settings.get(val => {
    console.log(val);
    // => {}
  });
});
```


***


clearSync()
-----------

**`settings.clearSync([options])`**

The synchronous verison of [`clear()`][method_clear].


***


applyDefaults()
---------------

**`settings.applyDefaults([options]):Promise`**

Applies defaults to the current settings object (deep). Settings that already exist will not be overwritten, but keys that exist within the defaults that don't exist within the setting object will be added. To configure defaults, use [`defaults()`][method_defaults]. For synchronous operation, use [`applyDefaultsSync()`][method_apply-defaults-sync].

**Arguments**

  * **`options`** *Object* (optional)
    * `atomicSaving` *Boolean* (optional) - Whether electron-settings should create a tmp file during save to ensure data-write consistency. Defaults to `true`.
    * `prettify` *Boolean* (optional) - Prettify the JSON output. Defaults to `false`.
    * `overwrite` *Boolean* (optional) - Overwrite pre-existing settings with their respective default values. Defaults to `false`.

**Examples**

Given:
```json
{
  "user": {
    "name": {
      "first": "George",
      "middle": "Oscar",
      "last": "Bluth"
    }
  }
}
```

Given:
```js
settings.defaults({
  "user": {
    "age": "unknown",
    "name": {
      "first": "Joe",
      "last": "Defacto"
    }
  }
});
```

Apply defaults.
```js
settings.getSync('user.age');
// => undefined

settings.applyDefaults().then(() => {
  settings.get().then(obj => {
    console.log(obj);
    // => {
    //   user: {
    //     age: 'unknown',
    //     name: {
    //       first: 'George',
    //       middle: 'Oscar',
    //       last: 'Bluth'
    //     }
    //   }
    // }
  });
});
```

Apply defaults and overwrite pre-existing settings with their respective values.
```js
settings.getSync('user.age');
// => undefined

settings.applyDefaults({ overwrite: true }).then(() => {
  settings.get().then(obj => {
    console.log(obj);
    // => {
    //   user: {
    //     age: 'unknown',
    //     name: {
    //       first: 'Joe',
    //       middle: 'Oscar',
    //       last: 'Defacto'
    //     }
    //   }
    // }
  });
});
```


***


applyDefaultsSync()
-------------------

**`settings.applyDefaultsSync([options])`**

The synchronous version of [`applyDefaults()`][method_apply-defaults].


***


resetToDefaults()
-----------------

**`settings.resetToDefaults([options]):Promise`**

Resets all settings to defaults. To configure defaults, use [`defaults()`][method_defaults]. For synchronous operation, use [`resetToDefaultsSync()`][method_reset-to-defaults-sync].

**Arguments**

  * **`options`** *Object* (optional)
    * `atomicSaving` *Boolean* (optional) - Whether electron-settings should create a tmp file during save to ensure data-write consistency. Defaults to `true`.
    * `prettify` *Boolean* (optional) - Prettify the JSON output. Defaults to `false`.

**Examples**

Given:
```json
{
  "foo": "qux",
  "snap": "crackle"
}
```

Given:
```js
settings.defaults({
  foo: 'bar'
});
```

Reset to defaults.
```js
settings.resetToDefaults().then(() => {
  settings.get().then(obj => {
    console.log(obj);
    // => {
    //  foo: 'bar'
    // }
  });
});
```


***


resetToDefaultsSync()
---------------------

**`settings.resetToDefaultsSync([options])`**

The synchronous version of [`resetToDefaults()`][method_reset-to-defaults].


***


observe()
---------

**`settings.observe(keyPath, handler):Function`**

Observes the chosen key path for changes and calls the handler if the value changes. Returns an Observer instance which has a `dispose` method. To unsubscribe, simply call `dispose()` on the returned key path observer.

**Arguments**

  * **`keyPath`** *String* - The path to the key that we wish to observe.
  * **`handler`** *Function* - The callback that will be invoked if the value at the chosen key path changes. Returns:
    * `evt` *Object*
      * `oldValue` *Any*
      * `newValue` *Any*

**Examples**

Given:
```json
{
  "foo": "bar"
}
```

Observe `"foo"`.
```js
settings.observe('foo', evt => {
  console.log(evt);
  // => {
  //   oldValue: 'bar',
  //   newValue: 'qux'
  // }
});

settings.set('foo', 'qux');
```

Dispose the key path observer.
```js
const observer = settings.observe('foo', evt => {
  console.log(evt);
  // => {
  //   oldValue: 'bar',
  //   newValue: 'qux'
  // }
});

settings.set('foo', 'qux').then(() => {
  observer.dispose();
});
```


***


getSettingsFilePath()
------------------------

**`settings.getSettingsFilePath():string`**

Returns the path to the config file. Typically found in your application's [user data directory](http://electron.atom.io/docs/api/app/#appgetpathname):

  * `~/Library/Application Support/YourApp` on MacOS.
  * `%APPDATA%/YourApp` on Windows.
  * `$XDG_CONFIG_HOME/YourApp` or `~/.config/YourApp` on Linux.

**Examples**

```js
settings.getSettingsFilePath();
// => /Users/You/Library/Application Support/YourApp/Settings
```


***
<small>Last updated **Aug. 16th, 2016** by [Nathan Buchar].</small>

<small>**Having trouble?** [Get help on Gitter](https://gitter.im/nathanbuchar/electron-settings).</small>






[Electron Settings]: ../../../

[Nathan Buchar]: (mailto:hello@nathanbuchar.com)

[method_configure]: #configure
[method_defaults]: #defaults
[method_observe]: #observe
[method_get-settings-file-path]: #getsettingsfilepath

[method_has]: #has
[method_has-sync]: #hassync
[method_get]: #get
[method_get-sync]: #getsync
[method_set]: #set
[method_set-sync]: #setsync
[method_delete]: #delete
[method_delete-sync]: #deletesync
[method_clear]: #clear
[method_clear-sync]: #clearsync
[method_apply-defaults]: #applydefaults
[method_apply-defaults-sync]: #applydefaultssync
[method_reset-to-defaults]: #resettodefaults
[method_reset-to-defaults-sync]: #resettodefaultssync
