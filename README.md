# Electron Settings

A simple and robust settings management library for [Electron](https://electronjs.org).

Born from Atom's original internal configuration manager and the settings manager of choice for Electron's own [API Demos app](https://github.com/electron/electron-api-demos), Electron Settings allows you to persist user settings and other data between app loads simply and easily.

[![Npm version][badge_npm-version]][external_npm]
[![Npm downloads][badge_npm-downloads]][external_npm]
[![David][badge_david]][external_david]
[![Travis][badge_travis]][external_travis]

<br/>

### Install

```
npm install electron-settings
```

### Demo

```ts
import settings from 'electron-settings';

await settings.set('color', {
  name: 'cerulean',
  code: {
    rgb: [0, 179, 230],
    hex: '#003BE6'
  }
});

await settings.get('color.name');
// => "cerulean"

await settings.get('color.code.rgb[1]');
// => 179
```

⚠ For Electron v10+, if you want to use electron-settings within a browser window, be sure to set the `enableRemoteModule` web preference to `true`. Otherwise you might get the error `Cannot read property 'app' of undefined`. See [#133](https://github.com/nathanbuchar/electron-settings/issues/133) for more info.

```js
new BrowserWindow({
  webPreferences: {
    enableRemoteModule: true // <-- Add me
  }
});
```

### API Docs

API docs and can be found at [electron-settings.js.org](https://electron-settings.js.org).



<br/>
<br/>
<hr/>

<small>**Having trouble?** [Get help on Gitter][external_gitter].</small>





[docs]: https://nathanbuchar.github.io/electron-settings/

[badge_npm-version]: https://img.shields.io/npm/v/electron-settings.svg
[badge_npm-downloads]: https://img.shields.io/npm/dm/electron-settings.svg
[badge_david]: https://img.shields.io/david/nathanbuchar/electron-settings.svg
[badge_travis]: https://img.shields.io/travis/nathanbuchar/electron-settings/master.svg

[external_david]: https://david-dm.org/nathanbuchar/electron-settings
[external_electron]: https://electron.atom.io
[external_gitter]: https://gitter.im/nathanbuchar/electron-settings
[external_npm]: https://npmjs.org/package/electron-settings
[external_travis]: https://travis-ci.org/nathanbuchar/electron-settings.svg?branch=master
