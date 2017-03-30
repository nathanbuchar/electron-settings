electron-settings
=================

A simple persistent user settings manager for [Electron][external_electron].

The settings manager of choice for [Electron's own demo app](https://github.com/electron/electron-api-demos) and originally adapted from Atom's own configuration manager, electron-settings allows you to save your users' settings to the disk so that they can be loaded in the next time your app starts without skipping a beat.

Also, you can [subscribe to settings and get notified when their value changes][api_method_watch]. So that's pretty neat.

[![npm version](https://badge.fury.io/js/electron-settings.svg)](http://badge.fury.io/js/electron-settings)
[![dependencies](https://david-dm.org/nathanbuchar/electron-settings.svg)](https://david-dm.org/nathanbuchar/electron-settings)
[![Build Status](https://travis-ci.org/nathanbuchar/electron-settings.svg?branch=master)](https://travis-ci.org/nathanbuchar/electron-settings)
[![Join the chat at https://gitter.im/nathanbuchar/electron-settings](https://badges.gitter.im/nathanbuchar/electron-settings.svg)](https://gitter.im/nathanbuchar/electron-settings?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)



***



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

settings.file();
// => /Users/Nathan/Application\ Support/MyApp/Settings
```


FAQs
----
A list of frequently asked questions can be found on the Wiki [here][wiki_faq].


API
---

The API docs can be found on the wiki [here][wiki_api].


License
-------
[ISC][license]


***
<small>**Having trouble?** [Get help on Gitter][external_gitter].</small>






[license]: ./LICENSE.md

[Nathan Buchar]: mailto:hello@nathanbuchar.com

[section_install]: #install
[section_demo]: #demo
[section_faqs]: #faq
[section_api]: #api
[section_authors]: #authors
[section_license]: #license

[wiki_api]: ./wiki/API-documentation
[wiki_faq]: ./wiki/FAQs

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
