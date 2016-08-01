[Electron Settings] » **Methods**


***


Methods
=======

* [`has()`][method_has] [*sync*][method_has-sync]
* [`get()`][method_get] [*sync*][method_get-sync]
* [`set()`][method_set] [*sync*][method_set-sync]
* [`delete()`][method_delete] [*sync*][method_delete-sync]
* [`reset()`][method_reset] [*sync*][method_reset-sync]
* [`clear()`][method_clear] [*sync*][method_clear-sync]
* [`observe()`][method_observe]
* [`configure()`][method_configure]
* [`getSettingsFilePath()`][method_getSettingsFilePath]



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
settings.get().then(value => {
  console.log(value);
  // => { foo: { bar: 'baz' } }
});
```

Get the value at `"foo.bar"`.
```js
settings.get('foo.bar').then(value => {
  console.log(value);
  // => 'baz'
});
```

Get the value at `"snap"`.
```js
settings.get('snap').then(value => {
  console.log(value);
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

**`settings.set([keyPath, ]value[, options]):Promise`**

Sets the value of the key at the chosen key path. If no key path is provided, this will set the value of the entire settings object instead, but `value` must be an object. For synchronous operation, use [`setSync()`][method_set-sync].

**Arguments**

  * **`keyPath`** *String* (optional) - The path to the key whose value we wish to set. This key need not already exist.
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
  settings.get('user.name.first').then(value => {
    console.log(value);
    // => 'Cosmo'
  });
});
```

Set the value of the entire settings object.
```js
settings.set({
  foo: {
    bar: 'baz'
  }
}).then(() => {
  settings.get(value => {
    console.log(value);
    // => { foo: { bar: 'baz' } }
  });
});
```


***


setSync()
---------

**`settings.setSync([keyPath, ]value[, options])`**

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

Set the value of the entire settings object.
```js
settings.setSync({
  foo: {
    bar: 'baz'
  }
});

settings.getSync();
// => { foo: { bar: 'baz' } }
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

**Example**

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
  settings.get('foo').then(value => {
    // => { foo: {} }
  });
});
```


***


deleteSync()
------------

**`settings.deleteSync(keyPath[, options])`**

The asynchronous version of [`delete()`][method_delete].

**Example**

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
settings.deleteSync('foo.bar');

settings.getSync('foo');
// => { foo: {} }
```


***


reset()
-------

**`settings.reset([keyPath, ][options]):Promise`**

Resets the chosen key path to its default value provided in `options.defaults`. If no key path is given, this will reset the entire settings object to defaults. You can configure global defaults using [`configure()`][method_configure]. For synchronous operation, use [`resetSync()`][method_reset-sync].

**Arguments**

  * **`keyPath`** *String* (optional) - The path to the key that we wish to reset the value of.
  * **`options`** *Object* (optional)
    * `atomicSaving` *Boolean* (optional) - Whether electron-settings should create a tmp file during save to ensure data-write consistency. Defaults to `true`.
    * `prettify` *Boolean* (optional) - Prettify the JSON output. Defaults to `false`.
    * `defaults` *Object* (optional) - Default settings. Defaults to `{}`.

**Example**

Given:
```json
{
  "foo": "qux"
}
```

Reset `"foo"` to its default value.
```js
settings.reset('foo', {
  defaults: {
    {
      "foo": "bar"
    }
  }
}).then(() => {
  settings.get().then(value => {
    // => { foo: 'bar' }
  });
});
```

Configure global defaults and reset all settings to defaults.
```js
settings.configure({
  defaults: {
    foo: 'bar'
  }
});

settings.reset().then(() => {
  settings.get().then(value => {
    // => { foo: 'bar' }
  });
});
```


***


resetSync()
-----------

**`settings.resetSync([keyPath, ][options])`**

The asynchronous version of [`reset()`][method_reset].

**Example**

Given:
```json
{
  "foo": "qux"
}
```

Reset `"foo"` to its default value.
```js
settings.resetSync('foo', {
  defaults: {
    {
      "foo": "bar"
    }
  }
});

settings.getSync();
// => { foo: 'bar' }
```

Configure global defaults and reset all settings to defaults.
```js
settings.configure({
  defaults: {
    foo: 'bar'
  }
});

settings.resetSync();

settings.getSync();
// => { foo: 'bar' }
```


***


clear()
-------

**`settings.clear([options]):Promise`**

Clears the entire settings object. For synchronous operation, use [`clearSync()`][method_clear-sync].

**Arguments**

  * **`options`** *Object* (optional)
    * `atomicSaving` *Boolean* (optional) - Whether electron-settings should create a tmp file during save to ensure data-write consistency. Defaults to `true`.
    * `prettify` *Boolean* (optional) - Prettify the JSON output. Defaults to `false`.

**Example**

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
  settings.get(value => {
    console.log(value);
    // => {}
  });
});
```


***


clearSync()
-----------

**`settings.clearSync([options])`**

The asynchronous verison of [`clear()`][method_clear].

**Example**

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
settings.clearSync();

settings.getSync();
// => {}
```


***


configure()
-----------

**`settings.configure(options)`**

Globally configures electron-settings options.

**Arguments**

* **`options`** *Object*
  * `atomicSaving` *Boolean* (optional) - Whether electron-settings should create a tmp file during save to ensure data-write consistency. Defaults to `true`.
  * `prettify` *Boolean* (optional) - Prettify the JSON output. Defaults to `false`.
  * `defaults` *Object* (optional) - Default settings. Applies to [`reset()`][method_reset] and [`resetSync()`][method_reset-sync]. Defaults to `{}`.


**Example**

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
settings.observe('foo' evt => {
  console.log(evt.newValue);
  // => 'baz'
});

settings.set('foo', 'baz');
```

Dispose the key path observer.
```js
const observer = settings.observe('foo' evt => {
  console.log(evt.newValue);
  // => 'baz'
});

settings.set('foo', 'baz').then(() => {
  observer.dispose();
});
```


getSettingsFilePath()
---------------------

**`settings.getSettingsFilePath():string`**

Returns the path to the config file. Typically found in your application's [user data directory](http://electron.atom.io/docs/api/app/#appgetpathname):

  * `~/Library/Application Support/YourApp` on MacOS.
  * `%APPDATA%/YourApp` on Windows.
  * `$XDG_CONFIG_HOME/YourApp` or `~/.config/YourApp` on Linux.

**Example**

```js
settings.getSettingsFilePath();
// => /Users/You/Library/Application Support/YourApp/Settings
```


***
<small>Last updated **Jul. 31st, 2016** by [Nathan Buchar].</small>

<small>**Having trouble?** [Get help on Gitter](https://gitter.im/nathanbuchar/electron-settings).</small>






[Electron Settings]: ../../../

[Nathan Buchar]: (mailto:hello@nathanbuchar.com)

[method_has]: #has
[method_has-sync]: #hassync
[method_get]: #get
[method_get-sync]: #getsync
[method_set]: #set
[method_set-sync]: #setsync
[method_delete]: #delete
[method_delete-sync]: #deletesync
[method_reset]: #reset
[method_reset-sync]: #resetsync
[method_clear]: #clear
[method_clear-sync]: #clearsync
[method_observe]: #observe
[method_configure]: #configure
[method_getSettingsFilePath]: #getsettingsfilepath
