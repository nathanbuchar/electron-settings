[Electron Settings] » **Events**


***


Events
=======

* [`create`][event_create]
* [`write`][event_write]


Settings#create
---------------

Emitted when the settings file has been created.

**Returns**

* **`pathToSettings`** *String* - The path to the settings file that was created.

**Example**

```js
settings.on('create', pathToSettings => {
  console.log(pathToSettings);
  // => /Users/You/Library/Application Support/YourApp/Settings
});
```


Settings#write
--------------

Emitted when the settings have been written to disk.

**Example**

```js
settings.on('write', () => {
  // Do something.
});
```


***
<small>Last updated **Jul. 31st 2016** by [Nathan Buchar].</small>

<small>**Having trouble?** [Get help on Gitter](https://gitter.im/nathanbuchar/electron-settings).</small>






[Electron Settings]: ../../../

[Nathan Buchar]: (mailto:hello@nathanbuchar.com)

[event_create]: #create
[event_write]: #write
