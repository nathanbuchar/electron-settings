[Electron Settings] » **FAQs**


***


FAQs
====


* ### What is a "key path"?

    With electron-settings, you are not just setting keys like you would with local storage. Instead, you are working with a JSON object, and a key path is a string that points to a specific key within that object—essentially using object dot notation in string form.

    For example, given the object `{ foo: { bar: 'baz' } }`, the value at the key path `"foo.bar"` is the string `"baz"`.

* ### What data types may be stored?

    You may set a key path to any value supported by JSON: an object, array, string, number, boolean, or `null`.

* ### Where is the settings file saved?

    Settings are saved in your app's [user data directory](http://electron.atom.io/docs/api/app/#appgetpathname) in a file called `Settings`. You can change the default directory by calling Electron's [`app.setPath()`](https://electron.atom.io/docs/api/app/#appsetpathname-path) method.

    By default, these are the paths to your app's user data directory.

    * `~/Library/Application\ Support/YourApp` on macOS.
    * `%APPDATA%/YourApp` on Windows.
    * `$XDG_CONFIG_HOME/YourApp` or `~/.config/YourApp` on Linux.

* ### Can I use electron-settings in both the main and renderer processes?

    You bet!

***
<small>Last updated **Mar. 28th, 2017** by [Nathan Buchar].</small>

<small>**Having trouble?** [Get help on Gitter][external_gitter].</small>






[Electron Settings]: ../../../
[Nathan Buchar]: mailto:hello@nathanbuchar.com

[external_gitter]: https://gitter.im/nathanbuchar/electron-settings
