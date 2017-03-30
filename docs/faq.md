[Electron Settings] » **FAQs**


***


FAQs
====


* **What is a "key path"?**

    With electron-settings, you are not just setting keys like you would with local storage. Instead, you are working with a JSON object, and a key path is a string that points to a specific key within that object—essentially using object dot notation in string form.

    For example, given the object `{ foo: { bar: 'baz' } }`, the value at the key path `"foo.bar"` is the string `"baz"`.

* **Where is the settings file saved?**

    In general, the settings file is stored in your app's [user data directory](http://electron.atom.io/docs/api/app/#appgetpathname) in a file called `Settings`. If you wish, you may change the default directory by calling Electron's [`app.setPath()`](https://electron.atom.io/docs/api/app/#appsetpathname-path) method, but this is **not recommended**. Otherwise, the default user data directory for your system can be found below.

    * **MacOS**

        If you're running macOS, your app's default user data directory is `~/Library/Application\ Support/<Your App>`.

    * **Windows**

        If you're running Windows, your app's default user data directory is `%APPDATA%/<Your App>`.

    * **Linux**

        If you're running Linux, your app's default user data directory is either `$XDG_CONFIG_HOME/<Your App>` or `~/.config/<Your App>`.

* **What data types may be stored?**

    You may set a key path to any value supported by JSON: an object, array, string, number, boolean, or `null`.

* **Can I use electron-settings in both the main and renderer processes?**

    You bet!

***
<small>Last updated **Mar. 28th, 2017** by [Nathan Buchar].</small>

<small>**Having trouble?** [Get help on Gitter][external_gitter].</small>






[Electron Settings]: ../../../
[Nathan Buchar]: mailto:hello@nathanbuchar.com

[external_gitter]: https://gitter.im/nathanbuchar/electron-settings
