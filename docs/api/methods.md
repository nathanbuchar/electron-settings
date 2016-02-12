Methods
=======

* [`get()`][method_get]
* [`set()`][method_set]
* [`unset()`][method_unset]
* [`clear()`][method_clear]
* [`watch()`][method_watch]
* [`unwatch()`][method_unwatch]
* [`getWatchers()`][method_getWatchers]
* [`clearWatchers()`][method_clearWatchers]
* [`on()`][method_on]
* [`off()`][method_off]
* [`getConfigFilePath()`][method_getConfigFilePath]
* [`destroy()`][method_destroy]



***



get()
-----

**`settings.get([keyPath])`**

Gets the value of a setting at the given [key path][docs_key-paths]. This will return all settings if no key path is specified or if the key path is `.`.

**Arguments**

* **`keyPath`** *(string)* - The key path to the setting.


**Example**

Get the value of `foo.bar`.

```js
// Given { foo: { bar: 'baz' } }

console.log(settings.get('foo.bar'));
// => 'baz'
```


***


set()
-----

**`settings.set(keyPath, value[, options])`**

Sets the value of a setting at the given [key path][docs_key-paths]. This will overwrite all settings if the key path is `.`. **Note:** `value` must be an object if the key path is `.`.

**Arguments**

* **`keyPath`** *(string)* - The key path to the setting.

* **`value`** *(&#42;)* - The value to set the chosen key path to.

* **`options`** *(Object)* - The `options` object.

  * `options.shouldSave` *(boolean)* - Whether we should save these changes to disk. Default `true`


**Example**

Set the value of `foo`.

  ```js
  // Given {}

  settings.set('foo', 'bar');

  console.log(settings.get());
  // => { foo: 'bar' }
  ```


***


unset()
-------

**`settings.unset(keyPath[, options])`**

Unsets the setting at the given [key path][docs_key-paths]. This will erase all settings if the key path is set to `.` (see [`clear()`][method_clear]).

**Arguments**

* **`keyPath`** *(string)* - The key path to the setting.

* **`options`** *(Object)* - The `options` object.

  * `options.shouldSave` *(boolean)* - Whether we should save these changes to disk. Default `true`


**Example**

Unset the value of `foo`.

```js
// Given { foo: { bar: 'baz' } }

settings.unset('foo');

console.log(settings.get());
// => {}
```


***


clear()
-------

**`settings.clear([options])`**

Clears all settings. Shorthand for `settings.unset('.')`.

**Arguments**

* **`options`** *(Object)* - The `options` object.

  * `options.shouldSave` *(boolean)* - Whether we should save these changes to disk. Default `true`


**Example**

```js
// Given { foo: { bar: 'baz' } }

settings.clear();

console.log(settings.get());
// => {}
```


***


watch()
-------

**`settings.watch(keyPath, handler)`**

Watches a [key path][docs_key-paths] or array of key paths and calls the handler function when any are changed. To watch dynamic key paths, you may use a [minimatch][external_package_minimatch] pattern.

**Arguments**

* **`keyPath`** *(string|Array)* - The key path or array of key paths to watch.

* **`handler`** *(Function)* - Invoked when the values of any of the chosen key paths are changed.


**Examples**

1. Watch the value of `foo`.

  ```js
  settings.watch('foo', data => {
    console.log(data);
  });

  settings.set('foo', 'bar'); // watched
  settings.set('baz', 'qux'); // not watched
  ```

2. Watch the values of `foo` and `bar` using the same change handler.

  ```js
  settings.watch(['foo', 'baz'], data => {
    console.log(data);
  });

  settings.set('foo', 'bar'); // watched
  settings.set('baz', 'qux'); // watched
  settings.set('zap', 'norf'); // not watched
  ```

3. Watch the values of any key path that ends in `.bar`.

  ```js
  settings.watch('*.bar', data => {
    console.log(data);
  });

  settings.set('foo.bar', 'baz'); // watched
  settings.set('baz.bar', 'qux'); // watched
  settings.set('qux.baz', 'zap'); // not watched
  ```

4. Watch the values of any key path that ends in either `.bar` or `.baz`.

  ```js
  settings.watch('*.+(bar|baz)', data => {
    console.log(data);
  });

  settings.set('foo.bar', 'baz'); // watched
  settings.set('baz.bar', 'qux'); // watched
  settings.set('qux.baz', 'zap'); // watched
  settings.set('zap.qux', 'norf'); // not watched
  ```


***


unwatch()
---------

**`settings.unwatch(keyPath)`**

Removes a watcher or array of watchers defined with the given [key path][docs_key-paths].

**Arguments**

* **`keyPath`** *(string|Array)* - The key path watcher or array of watchers to remove.


**Examples**

1. Removes the `"foo"` watcher.

  ```js
  // Given watch list { foo, bar }

  settings.unwatch('foo');

  console.log(settings.getWatchers());
  // => ['bar']
  ```

2. Removes the `"foo"` and `"bar"` watchers.

  ```js
  // Given watch list { foo, bar }

  settings.unwatch(['foo', 'bar'])

  console.log(settings.getWatchers());
  // => []
  ```

3. Removes the `"*.bar"` watcher.

  ```js
  // Given watch list { *.bar }

  settings.unwatch('*.bar');

  console.log(settings.getWatchers());
  // => []
  ```

4. Removes the `"*.+(bar|baz)"` watcher.

  ```js
  // Given watch list { *.+(bar|baz) }

  settings.unwatch('*.+(bar|baz)');

  console.log(settings.getWatchers());
  // => []
  ```


***


getWatchers()
-------------

**`settings.getconfigfilepath():Array`**

Gets an array of all watched key paths.


**Example**

```js
// Given watch list { foo, bar }

console.log(settings.getWatchers());
// => ['foo', 'bar']
```


***


clearWatchers()
---------------

**`settings.clearWatchers()`**

Clears all key path watchers.


**Example**

```js
// Given watch list { foo, bar }

settings.clearWatchers();

console.log(settings.getWatchers());
// => []
```


***


on()
----

**`settings.on(event, listener)`**

Binds an event listener to the `ElectronSettings` instance. For a list of available events, see [events][docs_events].

**Arguments**

* **`event`** *(string)* - The event name, see [events][docs_events].

* **`listener`** *(Function)* - The event handler function.


**Example**

```js
function handleChange(data) {
  data.changed.forEach(change => {
    console.log(change);
  });
}

settings.on('change', handleChange);
```


***


off()
-----

**`settings.off(event, listener)`**

Removes a bound event listener from the `ElectronSettings` instance. For a list of available events, see [events][docs_events].

**Arguments**

* **`event`** *(string)* - The event name, see [events][docs_events].

* **`listener`** *(Function)* - The event handler function.


**Example**

```js
function handleChange(data) {
  data.changed.forEach(change => {
    console.log(change);
  });
}

settings.off('change', handleChange);
```


***


getConfigFilePath()
-------------------

**`settings.getconfigfilepath():string`**

Gets the absolute path to the config file.


**Example**

```js
console.log(settings.getconfigfilepath());
// => /Users/Nathan/Library/Application Support/Electron/electron-settings/settings.json
```


***


destroy()
---------

**`settings.destroy()`**

Destroys the `ElectronSettings` instance. Use this before setting the instance to `null` for graceful cleanup of events and internal references. **Note:** The `ElectronSettings` instance will no longer usable.

**Example**

```js
settings.destroy();
settings = null;
```







[method_get]: #get
[method_set]: #set
[method_unset]: #unset
[method_clear]: #clear
[method_watch]: #watch
[method_unwatch]: #unwatch
[method_getWatchers]: #getwatchers
[method_clearWatchers]: #clearwatchers
[method_on]: #on
[method_off]: #off
[method_getConfigFilePath]: #getconfigfilepath
[method_destroy]: #destroy

[docs_key-paths]: ./docs/api/key-paths.md
[docs_events]: ./docs/api/events.md
[docs_watchers]: ./docs/api/watchers.md

[external_package_minimatch]: https://npmjs.org/package/minimatch
