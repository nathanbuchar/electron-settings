[Electron Settings] » **API**


***


Methods
=======

* [`has()`][method_has]
* [`get()`][method_get]
* [`getAll()`][method_get-all]
* [`set()`][method_set]
* [`setAll()`][method_set-all]
* [`delete()`][method_delete]
* [`deleteAll()`][method_delete-all]
* [`watch()`][method_watch]



***



* ## has()

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

    [Back to Top]


* ## get()

    **`settings.get(keyPath[, defaultValue]):any`**

    Returns the value at the given key path, or sets the value at that key path to the default value, if provided, if the key does not exist. See also: [`getAll()`][method_get-all].

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

    [Back to Top]


* ## getAll()

    **`settings.getAll():Object`**

    Returns all settings. See also: [`get()`][method_get].

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

    [Back to Top]


* ## set()

    **`settings.set(keyPath, value[, options])`**

    Sets the value at the given key path. See also: [`setAll()`][method_set-all].

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

    [Back to Top]


* ## setAll()

    **`settings.setAll(obj[, options])`**

    Sets all settings. See also: [`set()`][method_set].

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

    [Back to Top]


* ## delete()

    **`settings.delete(keyPath[, options])`**

    Deletes the key and value at the given key path. See also: [`deleteAll()`][method_delete-all].

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

    [Back to Top]


* ## deleteAll()

    **`settings.deleteAll([options])`**

    Deletes all settings. See also: [`delete()`][method_delete].

    ***

    **Parameters**

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

    Deletes all settings.
    ```js
    settings.deleteAll();

    settings.getAll();
    // => {}
    ```

    [Back to Top]


* ## watch()

    **`settings.watch(keyPath, handler):Observer`**

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

    Dispose the key path watcher if the key is deleted.
    ```js
    const observer = settings.watch('foo', newValue => {
      if (newValue === undefined) {
        observer.dispose();
      }
    });

    settings.delete('foo');
    });
    ```

***
<small>Last updated **Mar. 29th, 2017** by [Nathan Buchar].</small>

<small>**Having trouble?** [Get help on Gitter][external_gitter].</small>






[Electron Settings]: ../../../
[Back to Top]: #methods
[Nathan Buchar]: mailto:hello@nathanbuchar.com

[method_has]: #has
[method_get]: #get
[method_get-all]: #getall
[method_set]: #set
[method_set-all]: #setall
[method_delete]: #delete
[method_delete-all]: #deleteall
[method_watch]: #watch

[external_gitter]: https://gitter.im/nathanbuchar/electron-settings
