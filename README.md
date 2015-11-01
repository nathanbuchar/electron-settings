# Electron-Settings

User settings manager for Electron, adapted from [Atom/config](https://github.com/atom/atom/blob/master/src/config.coffee).

***

## Options

|Key|Type|Description|Default|
|--:|:--:|:----------|:-----:|
|`shouldSave`|`boolean`|Whether we should save changes to disk.|`true`|

## Methods

* [`set`](#setkeypath-value-options)
* [`get`](#getkeypathobject)
* [`unset`](#unsetkeypath-options)
* [`getUserConfigPath`](#getuserconfigpathstring)

***

### `set(keyPath, value[, options])`

Sets the value of a configuration setting at the given key-path.

#### Parameters
|Parameter|Type|Description|Required|Default|
|--------:|:--:|:----------|:------:|:-----:|
|`keyPath`|`string`|The key-path.|✓|
|`value`|`*`|The value to set the given key-path.|✓|
|`options`|`Object`|ElectronSettings options.||See [options][options]|

#### Examples

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

### `get(keyPath):Object`

Gets the value of a configuration setting at the given key-path. Returns an `Object`.

#### Parameters
|Parameter|Type|Description|Required|Default|
|--------:|:--:|:----------|:------:|:-----:|
|`keyPath`|`string`|The key-path.|

#### Examples

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

### `unset(keyPath[, options])`

Unsets a configuration setting at the given key-path.

#### Parameters
|Parameter|Type|Description|Required|Default|
|--------:|:--:|:----------|:------:|:-----:|
|`keyPath`|`string`|The key-path.|✓|
|`options`|`Object`|ElectronSettings options.||See [options][options]|

#### Examples

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

### `getUserConfigPath():string`

Gets the string path to the config file being used. Returns a `string`.

### Example

```js
let ElectronSettings = require('electron-settings');
let settings = new ElectronSettings();

console.log(settings.getUserConfigPath());
// => /Users/Nathan/Library/Application Support/Electron/config/settings.json
```

***

## Todo
* `observe` method to watch when a particular key-path has changed.
* Allow default setting handling and merging with pre-existing settings.
* Write tests.

## Authors
* [Nathan Buchar](mailto:hello@nathanbuchar.com)

## License
ISC

[options]: #options
