electron-settings
=================

[![Npm version](https://img.shields.io/npm/v/electron-settings.svg)](https://npmjs.org/package/electron-settings)
[![Npm downloads](https://img.shields.io/npm/dm/electron-settings.svg)](https://npmjs.org/package/electron-settings)
[![David](https://img.shields.io/david/nathanbuchar/electron-settings.svg)](https://david-dm.org/nathanbuchar/electron-settings)
[![Travis](https://img.shields.io/travis/nathanbuchar/electron-settings/master.svg)](https://travis-ci.org/nathanbuchar/electron-settings.svg?branch=master)
[![Gitter](https://img.shields.io/gitter/room/nathanbuchar/electron-settings.svg)](https://gitter.im/nathanbuchar/electron-settings)

A simple persistent user settings framework for [Electron](https://electron.atom.io).

Originally adapted from Atom's own configuration manager and the settings manager of choice for [Electron's own demo app](https://github.com/electron/electron-api-demos), electron-settings allows you to persist user settings and other data simply and easily.

Also, you can [subscribe to properties](./wiki/API-documentation#watch) and get notified when their values change. So that's pretty nifty.

<br/>


Install
-------

```
$ npm install --save electron-settings
```


Demo
----

```js
const settings = require('electron-settings');

settings.set('name', {
  first: 'Cosmo',
  last: 'Kramer'
});

settings.get('name.first');
// => "Cosmo"

settings.has('name.middle');
// => false
```


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

<small>**Having trouble?** [Get help on Gitter](https://gitter.im/nathanbuchar/electron-settings).</small>






[license]: ./LICENSE.md

[wiki_home]: https://github.com/nathanbuchar/electron-settings/wiki
[wiki_api]: https://github.com/nathanbuchar/electron-settings/wiki/API-documentation
[wiki_faq]: https://github.com/nathanbuchar/electron-settings/wiki/FAQs
[wiki_changelog]: https://github.com/nathanbuchar/electron-settings/wiki/Changelog
