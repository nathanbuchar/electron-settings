electron-settings
=================

[![Npm version][badge_npm-version]][external_npm]
[![Npm downloads][badge_npm-downloads]][external_npm]
[![David][badge_david]][external_david]
[![Travis][badge_travis]][external_travis]
[![Gitter][badge_gitter]][external_gitter]

A simple persistent user settings framework for [Electron][external_electron].

Originally adapted from Atom's own configuration manager and the settings manager of choice for [Electron's own demo app](https://github.com/electron/electron-api-demos), electron-settings allows you to persist user settings and other data simply and easily.

Also, you can [subscribe to properties](https://github.com/nathanbuchar/electron-settings/wiki/API-documentation#watch) and get notified when their values change. So that's pretty nifty.

<br/>


Install
-------

```
$ npm install --save electron-settings
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



<br/>
<br/>
<hr/>

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
