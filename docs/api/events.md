Events
======

* [`change`][event_change]
* [`error`][event_error]
* [`save`][event_save]



***



change
------

**`settings.on('change', handler)`**

Called when any change occurs to the settings file. It passes the following parameter into `handler`:

* **`data`** *(Object)* - The event data.

  * `data.changed` *(Array)* - An array of all changes made.


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


error
-----

**`settings.on('error', handler)`**

Called when an error occurs (cannot save to disk). It passes the following parameter into `handler`:

* **`err`** *(Error)* - The Error object.


**Example**

```js
function handleError(err) {
  console.err(err);
}

settings.on('error', handleError);
```


***


save
-----

**`settings.on('save', handler)`**

Called when the changes are saved to disk.


**Example**

```js
function handleSave() {
  console.log('Changes saved to disk');
}

settings.on('save', handleSave);
```








[event_change]: #change
[event_error]: #error
[event_save]: #save
