electron-settings
=================

[![npm version](https://badge.fury.io/js/electron-settings.svg)](http://badge.fury.io/js/electron-settings)
[![dependencies](https://david-dm.org/nathanbuchar/electron-settings.svg)](https://david-dm.org/nathanbuchar/electron-settings)
[![Build Status](https://travis-ci.org/nathanbuchar/electron-settings.svg?branch=master)](https://travis-ci.org/nathanbuchar/electron-settings)
[![Join the chat at https://gitter.im/nathanbuchar/electron-settings](https://badges.gitter.im/nathanbuchar/electron-settings.svg)](https://gitter.im/nathanbuchar/electron-settings?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A simple persistent user settings framework for [Electron][external_electron].

Originally adapted from Atom's own configuration manager and the settings manager of choice for [Electron's own demo app](https://github.com/electron/electron-api-demos), electron-settings allows you to persist user settings and other data simply and easily.

Also, you can [subscribe to properties][api_method_watch] and get notified when their values change. So that's pretty nifty.

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

* [API Documentation][wiki_api]
* [FAQs][wiki_faq]
* [Changelog][wiki_changelog]
* [License (ISC)][license]



<br/>
<br/>
<hr/>

<small>**Having trouble?** [Get help on Gitter][external_gitter].</small>






[license]: ./LICENSE.md

[section_install]: #install
[section_demo]: #demo

[wiki_api]: ./wiki/API-documentation
[wiki_faq]: ./wiki/FAQs
[wiki_changelog]: ./wiki/Changelog

[api_method_has]: ./wiki/API-documentation#has
[api_method_get]: ./wiki/API-documentation#get
[api_method_get-all]: ./wiki/API-documentation#getall
[api_method_set]: ./wiki/API-documentation#set
[api_method_set-all]: ./wiki/API-documentation#setall
[api_method_delete]: ./wiki/API-documentation#delete
[api_method_delete-all]: ./wiki/API-documentation#deleteall
[api_method_watch]: ./wiki/API-documentation#watch
[api_method_file]: ./wiki/API-documentation#file

[external_electron]: https://electron.atom.io
[external_gitter]: https://gitter.im/nathanbuchar/electron-settings
