electron-settings
=================

A simple persistent user settings manager for [Electron][external_electron].

Originally adapted from Atom's own configuration manager, electron-settings allows you to save your users' settings to the disk so that they can be loaded in the next time your app starts without skipping a beat.

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
```


***


FAQs
----
A list of frequently asked questions can be found [here][docs_faq].


API
---

The API docs can be found [here][docs_api]. Or, if you're know what you're looking for…

* [`has()`][api_method_has]
* [`get()`][api_method_get]
* [`getAll()`][api_method_get-all]
* [`set()`][api_method_set]
* [`setAll()`][api_method_set-all]
* [`delete()`][api_method_delete]
* [`deleteAll()`][api_method_delete-all]
* [`watch()`][api_method_watch]


Authors
-------
* [Nathan Buchar] (Owner)


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

[docs_api]: ./docs/api.md
[docs_faq]: ./docs/faq.md

[api_method_has]: ./docs/api.md#has
[api_method_get]: ./docs/api.md##get
[api_method_get-all]: ./docs/api.md##getall
[api_method_set]: ./docs/api.md##set
[api_method_set-all]: ./docs/api.md##setall
[api_method_delete]: ./docs/api.md##delete
[api_method_delete-all]: ./docs/api.md##deleteall
[api_method_watch]: ./docs/api.md##watch

[external_electron]: https://electron.atom.io
[external_gitter]: https://gitter.im/nathanbuchar/electron-settings
