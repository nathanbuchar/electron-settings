Changelog		
=========		
All notable changes to this project will be documented in this file.		
This project adheres to [Semantic Versioning](http://semver.org/).		

***

v3.0.4 - Mar. 29, 2017
----------------------
* Remove `electron-prebuilt` as a dependency, as it has been deprecated in lieu of `electron`. ([`4c1df12`](https://github.com/nathanbuchar/electron-settings/commit/4c1df12a567192b4afe072f1178eea32a653e0c2))

v3.0.3 - Mar. 29, 2017
----------------------
* Update source code and tests to be compliant with all ESlint rules. ([`9cee966`](https://github.com/nathanbuchar/electron-settings/commit/9cee9667cce71a914d8d0b3e52227fc1c27cb4af), [`75aad3d`](https://github.com/nathanbuchar/electron-settings/commit/75aad3d9c61c15db9088542d8a20251d6e2f4e6b))
* Remove Chai in lieu of Node's native `assert` module. ([`75aad3d`](https://github.com/nathanbuchar/electron-settings/commit/75aad3d9c61c15db9088542d8a20251d6e2f4e6b))

v3.0.2 - Mar. 28, 2017
----------------------
* Updated README and extracted API docs and FAQs into their own files. This is to encourage users on npm to visit GitHub as well as simplify the README as a whole. ([`7df95ee`](https://github.com/nathanbuchar/electron-settings/commit/7df95ee830ae932cadf72878e7d701e2ceab13ff))

v3.0.1 - Mar. 28, 2017
----------------------		
* Added support to dynamically choose the user data path before every read and write instead of caching it during instantiation. This is because it is possible to change this path programatically via `app.setPath('userData', destination)`. Fixes [#47](https://github.com/nathanbuchar/electron-settings/issues/47). ([`53115c7`](https://github.com/nathanbuchar/electron-settings/commit/53115c797e2caa882f79d52a00b597a9666bf8e2))
* Added `CHANGELOG.md` starting from v3.0.0. ([`ba09ec7`](https://github.com/nathanbuchar/electron-settings/commit/ba09ec74a8a237f8c2840d5dc6ccc8aa5205458a))

v3.0.0 - Mar. 28, 2017
----------------------		
* Initial release.
