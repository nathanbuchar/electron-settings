Electron-Settings
=================

Save settings to a disk and load them in when your app starts. A user settings manager for Electron, adapted from [Atom/config](https://github.com/atom/atom/blob/master/src/config.coffee).

**Requires Electron 0.35.0 or above.**



***



Usage
-----

To use `electron-settings`, first import the class, then create a new `electron-settings` instance:

```js
let ElectronSettings = require('electron-settings');
let settings = new ElectronSettings();
```

`electron-settings` will automatically 



***



Methods
-------

* [`set`](#set)
* [`get`](#get)
* [`unset`](#unset)
* [`getUserConfigPath`](#getuserconfigpath)


***


### set()

**`set(keyPath, value[, options])`**

Sets the value of a configuration setting at the given key-path.


**Parameters**

|      Name |   Type   | Description                          | Required |    Default    |
| --------: | :------: | :----------------------------------- | :------: | :-----------: |
| `keyPath` | `string` | The key-path for this setting.       |    ✓     |               |
|   `value` |   `*`    | The value to set the given key-path. |    ✓     |               |
| `options` | `Object` | `electron-settings` options object.  |          | See [options] |


**Examples**

1. Simple example with basic key-path.
  ```js
  let ElectronSettings = require('electron-settings');
  let settings = new ElectronSettings();

  settings.set('foo', 'bar');

  console.log(settings.get());
  // => { foo: 'bar' }
  ```
2. Advanced example with complex key-path.
  ```js
  let ElectronSettings = require('electron-settings');
  let settings = new ElectronSettings();

  settings.set('foo.bar.baz', 'qux');

  console.log(settings.get());
  // => { foo: { bar: { baz: 'qux' } } }
  ```
3. Advanced example with basic key-path and complex value.
  ```js
  let ElectronSettings = require('electron-settings');
  let settings = new ElectronSettings();

  settings.set('foo', {
    snap: {
      crackle: 'pop'
    }
  });

  console.log(settings.get());
  // => { foo: { snap: { crackle: 'pop' } } }
  ```
4. Overwrite settings without defining a key-path.
  ```js
  let ElectronSettings = require('electron-settings');
  let settings = new ElectronSettings();

  // This will overwrite any pre-existing settings.
  settings.set({
    foo: 'bar'
  });

  console.log(settings.get());
  // => { foo: 'bar' }
  ```


***


get()
-----

**`get(keyPath):Object`**

Gets the value of a configuration setting at the given key-path. Returns an `Object`.


**Parameters**

|      Name |   Type   | Description                   | Required |
| --------: | :------: | :---------------------------- | :------: |
| `keyPath` | `string` | The key-path for the setting. |    ✓     |


**Examples**

1. Simple example with basic key-path.
  ```js
  let ElectronSettings = require('electron-settings');
  let settings = new ElectronSettings();

  settings.set('foo', 'bar');

  console.log(settings.get('foo'));
  // => 'bar'
  ```
2. Advanced example with complex key-path.
  ```js
  let ElectronSettings = require('electron-settings');
  let settings = new ElectronSettings();

  settings.set('foo.bar.baz', 'qux');

  console.log(settings.get('foo.bar'));
  // => { baz: 'qux' }
  ```
2. Get all settings.
  ```js
  let ElectronSettings = require('electron-settings');
  let settings = new ElectronSettings();

  settings.set('foo.bar.baz', 'qux');

  console.log(settings.get());
  // => { foo: { bar: { baz: 'qux' } } }
  ```


***


unset()
-------

**`unset(keyPath[, options])`**

Unsets a configuration setting at the given key-path.


**Parameters**

|      Name |   Type   | Description                         | Required |    Default    |
| --------: | :------: | :---------------------------------- | :------: | :-----------: |
| `keyPath` | `string` | The key-path for this setting.      |    ✓     |               |
| `options` | `Object` | `electron-settings` options object. |          | See [options] |


**Examples**

1. Simple example with basic key-path.
  ```js
  let ElectronSettings = require('electron-settings');
  let settings = new ElectronSettings();

  settings.set('foo', 'bar');

  console.log(settings.get());
  // => { foo: 'bar' }

  settings.unset('foo');

  console.log(settings.get());
  // => {}
  ```
2. Advanced example with complex key-path.
  ```js
  let ElectronSettings = require('electron-settings');
  let settings = new ElectronSettings();

  settings.set('foo.bar.baz', 'qux');

  console.log(settings.get());
  // => { foo: { bar: { baz: 'qux' } } }

  settings.unset('foo.bar');

  console.log(settings.get());
  // => { foo: null }
  ```


***


getUserConfigPath()
-------------------

**`getUserConfigPath():string`**

Gets the string path to the config file being used. Returns a `string`.

### Example

```js
let ElectronSettings = require('electron-settings');
let settings = new ElectronSettings();

console.log(settings.getUserConfigPath());
// => /Users/Nathan/Library/Application Support/Electron/config/settings.json
```



***



Options
-------

|          Key |    Type   | Description                             | Default |
| -----------: | :-------: | :-------------------------------------- | :-----: |
| `shouldSave` | `boolean` | Whether we should save changes to disk. | `true`  |




***



Todo
----
* `observe` method to watch when a particular key-path has changed.
* Allow default setting handling and merging with pre-existing settings.
* Write tests.


Authors
-------
* [Nathan Buchar](mailto:hello@nathanbuchar.com)


License
-------
MIT




[options]: #options
