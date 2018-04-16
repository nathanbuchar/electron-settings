electron-settings
=================

This is a fork version of [electron-settings](https://www.npmjs.com/package/electron-settings) with some below changes
 - Use lodash to simplify the code. Make code easier to understand
 - Use memory watcher instead of file watcher. Make watcher more efficient, we do not have to read file everytime we want to get a propety
 - Support unwatch api that allow user to unregiester his watcher

**Please note:** because this library watches on memory instead of file. Please not that the change event **is not fired** when you change value directly on setting file



Install
-------

```
$ npm install --save git+https://github.com/anyTV/electron-settings.git
```


Demo
----

```js
const { app } = require('electron');
const settings = require('electron-settings');

app.on('ready', () => {

  settings.set('name', {
    first: 'Cosmo',
    last: 'Kramer'
  });

  settings.get('name.first');
  // => "Cosmo"

  settings.has('name.middle');
  // => false
});
```

:warning: **Please note:** Any and all interaction with electron-settings must be executed after the Electron app has fired the `ready` event, otherwise your app may encounter unexpected errors or data loss.


Resources
---------

* [Wiki][wiki_home]
* [API Documentation][wiki_api]
* [FAQs][wiki_faq]
* [Changelog][wiki_changelog]
* [License (ISC)][license]


<small>**Having trouble?** [Get help on Gitter][external_gitter].</small>






[license]: ./LICENSE.md

[badge_npm-version]: https://img.shields.io/npm/v/electron-settings.svg
[badge_npm-downloads]: https://img.shields.io/npm/dm/electron-settings.svg
[badge_david]: https://img.shields.io/david/nathanbuchar/electron-settings.svg
[badge_travis]: https://img.shields.io/travis/nathanbuchar/electron-settings/master.svg
[badge_gitter]: https://img.shields.io/gitter/room/nathanbuchar/electron-settings.svg

[wiki_home]: https://github.com/nathanbuchar/electron-settings/wiki
[wiki_api]: https://github.com/nathanbuchar/electron-settings/wiki/API-documentation
[wiki_faq]: https://github.com/nathanbuchar/electron-settings/wiki/FAQs
[wiki_changelog]: https://github.com/nathanbuchar/electron-settings/wiki/Changelog

[external_david]: https://david-dm.org/nathanbuchar/electron-settings
[external_electron]: https://electron.atom.io
[external_gitter]: https://gitter.im/nathanbuchar/electron-settings
[external_npm]: https://npmjs.org/package/electron-settings
[external_travis]: https://travis-ci.org/nathanbuchar/electron-settings.svg?branch=master
