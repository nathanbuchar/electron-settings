Changelog		
=========		
All notable changes to this project will be documented in this file.		
This project adheres to [Semantic Versioning](http://semver.org/).		

***		

v3.0.1 - Mar. 28, 2017
----------------------		
* Added support to dynamically choose the user data path before every read and write instead of caching it during instantiation. This is because it is possible to change this path programatically via `app.setPath('userData', destination)`. Fixes #47.
* Added `CHANGELOG.md` starting from v3.0.0.

v3.0.0 - Mar. 28, 2017
----------------------		
* Initial release.
