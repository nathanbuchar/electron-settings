Changelog		
=========		
All notable changes to this project will be documented in this file.		
This project adheres to [Semantic Versioning](http://semver.org/).		

***		

v3.0.1 - Mar. 28, 2017
----------------------		
* Added support to dynamically choose the user data path before every read and write instead of caching it during instantiation. This is because it is possible to change this path programatically via `app.setPath('userData', destination)`. Fixes [#47](https://github.com/nathanbuchar/electron-settings/issues/47). ([`53115c7`](https://github.com/nathanbuchar/electron-settings/commit/53115c797e2caa882f79d52a00b597a9666bf8e2))
* Added `CHANGELOG.md` starting from v3.0.0. ([`ba09ec7`](https://github.com/nathanbuchar/electron-settings/commit/ba09ec74a8a237f8c2840d5dc6ccc8aa5205458a))

v3.0.0 - Mar. 28, 2017
----------------------		
* Initial release.
