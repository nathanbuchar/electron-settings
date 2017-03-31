electron-settings
=================

[![npm version](https://badge.fury.io/js/electron-settings.svg)](http://badge.fury.io/js/electron-settings)
[![Npm Downloads](https://img.shields.io/npm/dm/electron-settings.svg)](https://npmjs.org/package/electron-settings)
[![dependencies](https://david-dm.org/nathanbuchar/electron-settings.svg)](https://david-dm.org/nathanbuchar/electron-settings)
[![Build Status](https://travis-ci.org/nathanbuchar/electron-settings.svg?branch=master)](https://travis-ci.org/nathanbuchar/electron-settings)
[![Join the chat at https://gitter.im/nathanbuchar/electron-settings](https://badges.gitter.im/nathanbuchar/electron-settings.svg)](https://gitter.im/nathanbuchar/electron-settings?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

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

[wiki_home]: ./wiki
[wiki_api]: ./wiki/API-documentation
[wiki_faq]: ./wiki/FAQs
[wiki_changelog]: ./wiki/Changelog
