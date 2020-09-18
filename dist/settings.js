"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/* eslint linebreak-style: ["error", "windows"] */
var electron_1 = __importDefault(require("electron"));
var fs_1 = __importDefault(require("fs"));
var mkdirp_1 = __importDefault(require("mkdirp"));
var path_1 = __importDefault(require("path"));
var write_file_atomic_1 = __importDefault(require("write-file-atomic"));
var lodash_get_1 = __importDefault(require("lodash.get"));
var lodash_has_1 = __importDefault(require("lodash.has"));
var lodash_set_1 = __importDefault(require("lodash.set"));
var lodash_unset_1 = __importDefault(require("lodash.unset"));
/** @internal */
var defaultConfig = {
    atomicSave: true,
    fileName: 'settings.json',
    numSpaces: 2,
    prettify: false,
};
/** @internal */
var config = __assign({}, defaultConfig);
/**
 * Returns the Electron instance. The developer may define
 * a custom Electron instance by using `configure()`.
 *
 * @returns The Electron instance.
 * @internal
 */
function getElectron() {
    var _a;
    return (_a = config.electron) !== null && _a !== void 0 ? _a : electron_1.default;
}
/**
 * Returns the Electron app.
 *
 * @returns The Electron app.
 * @internal
 */
function getElectronApp() {
    return getElectron().app;
}
/**
 * Returns the path to the settings directory. The path
 * may be customized by the developer by using
 * `configure()`.
 *
 * @returns The path to the settings directory.
 * @internal
 */
function getSettingsDirPath() {
    var _a;
    return (_a = config.dir) !== null && _a !== void 0 ? _a : getElectronApp().getPath('userData');
}
/**
 * Returns the path to the settings file. The file name
 * may be customized by the developer using `configure()`.
 *
 * @returns The path to the settings file.
 * @internal
 */
function getSettingsFilePath() {
    var dir = getSettingsDirPath();
    return path_1.default.join(dir, config.fileName);
}
/**
 * Ensures that the settings file exists. If it does not
 * exist, then it is created.
 *
 * @returns A promise which resolves when the settings file exists.
 * @internal
 */
function ensureSettingsFile() {
    var filePath = getSettingsFilePath();
    return new Promise(function (resolve, reject) {
        fs_1.default.stat(filePath, function (err) {
            if (err) {
                if (err.code === 'ENOENT') {
                    proxySaveSettings({}).then(resolve, reject);
                }
                else {
                    reject(err);
                }
            }
            else {
                resolve();
            }
        });
    });
}
/**
 * Ensures that the settings file exists. If it does not
 * exist, then it is created.
 *
 * @internal
 */
function ensureSettingsFileSync() {
    var filePath = getSettingsFilePath();
    try {
        fs_1.default.statSync(filePath);
    }
    catch (err) {
        if (err) {
            if (err.code === 'ENOENT') {
                proxySaveSettingsSync({});
            }
            else {
                throw err;
            }
        }
    }
}
/**
 * Ensures that the settings directory exists. If it does
 * not exist, then it is created.
 *
 * @returns A promise which resolves when the settings dir exists.
 * @internal
 */
function ensureSettingsDir() {
    var dirPath = getSettingsDirPath();
    return new Promise(function (resolve, reject) {
        fs_1.default.stat(dirPath, function (err) {
            if (err) {
                if (err.code === 'ENOENT') {
                    mkdirp_1.default(dirPath).then(function () { return resolve(); }, reject);
                }
                else {
                    reject(err);
                }
            }
            else {
                resolve();
            }
        });
    });
}
/**
 * Ensures that the settings directory exists. If it does
 * not exist, then it is created.
 *
 * @internal
 */
function ensureSettingsDirSync() {
    var dirPath = getSettingsDirPath();
    try {
        fs_1.default.statSync(dirPath);
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            mkdirp_1.default.sync(dirPath);
        }
        else {
            throw err;
        }
    }
}
/**
 * Checks what process is it, depending on that either calls [[loadSettings|loadSettings()]]
 * directly or via sending async message to main process.
 *
 * @returns A promise which resolves with the settings object.
 * @internal
 */
function proxyLoadSettings() {
    var ipcRenderer = getElectron().ipcRenderer;
    return ipcRenderer
        ? ipcRenderer.invoke('electron-settings-load-settings')
        : loadSettings();
}
/**
 * First ensures that the settings file exists then loads
 * the settings from the disk.
 *
 * @returns A promise which resolves with the settings object.
 * @internal
 */
function loadSettings() {
    return ensureSettingsFile().then(function () {
        var filePath = getSettingsFilePath();
        return new Promise(function (resolve, reject) {
            fs_1.default.readFile(filePath, 'utf-8', function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch (err) {
                        reject(err);
                    }
                }
            });
        });
    });
}
/**
 * Checks what process is it, depending on that either calls [[loadSettingsSync|loadSettingsSync()]]
 * directly or via sending sync message to main process.
 *
 * @returns The settings object.
 * @internal
 */
function proxyLoadSettingsync() {
    var ipcRenderer = getElectron().ipcRenderer;
    return ipcRenderer
        ? ipcRenderer.sendSync('electron-settings-load-settings-sync')
        : loadSettingsSync();
}
/**
 * First ensures that the settings file exists then loads
 * the settings from the disk.
 *
 * @returns The settings object.
 * @internal
 */
function loadSettingsSync() {
    var filePath = getSettingsFilePath();
    ensureSettingsFileSync();
    var data = fs_1.default.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}
/**
 * Checks what process is it, depending on that either calls [[saveSettings|saveSettings()]]
 * directly or via sending async message to main process.
 *
 * @param obj The settings object to save.
 * @returns A promise which resolves when the settings have been saved.
 * @internal
 */
function proxySaveSettings(obj) {
    var ipcRenderer = getElectron().ipcRenderer;
    return ipcRenderer
        ? ipcRenderer.invoke('electron-settings-save-settings', obj)
        : saveSettings(obj);
}
/**
 * Saves the settings to the disk.
 *
 * @param obj The settings object to save.
 * @returns A promise which resolves when the settings have been saved.
 * @internal
 */
function saveSettings(obj) {
    return ensureSettingsDir().then(function () {
        var filePath = getSettingsFilePath();
        var numSpaces = config.prettify ? config.numSpaces : 0;
        var data = JSON.stringify(obj, null, numSpaces);
        return new Promise(function (resolve, reject) {
            if (config.atomicSave) {
                write_file_atomic_1.default(filePath, data, function (err) {
                    return err
                        ? reject(err)
                        : resolve();
                });
            }
            else {
                fs_1.default.writeFile(filePath, data, function (err) {
                    return err
                        ? reject(err)
                        : resolve();
                });
            }
        });
    });
}
/**
 * Checks what process is it, depending on that either calls [[saveSettingsSync|saveSettingsSync()]]
 * directly or via sending async message to main process.
 *
 * @param obj The settings object to save.
 * @internal
 */
function proxySaveSettingsSync(obj) {
    var ipcRenderer = getElectron().ipcRenderer;
    if (ipcRenderer) {
        ipcRenderer.sendSync('electron-settings-save-settings-sync', obj);
    }
    else {
        saveSettingsSync(obj);
    }
}
/**
 * Saves the settings to the disk.
 *
 * @param obj The settings object to save.
 * @internal
 */
function saveSettingsSync(obj) {
    var filePath = getSettingsFilePath();
    var numSpaces = config.prettify ? config.numSpaces : 0;
    var data = JSON.stringify(obj, null, numSpaces);
    ensureSettingsDirSync();
    if (config.atomicSave) {
        write_file_atomic_1.default.sync(filePath, data);
    }
    else {
        fs_1.default.writeFileSync(filePath, data);
    }
}
/**
 * Initializes the Electron Settings in the main process.
 * Throws an error if you try to call it in renderer process.
 *
 * @example
 *
 *     settings.init();
 */
function init() {
    var ipcMain = getElectron().ipcMain;
    if (!ipcMain) {
        throw new Error('You should init settings only in main process');
    }
    ipcMain.handle('electron-settings-load-settings', function () {
        return loadSettings();
    });
    ipcMain.on('electron-settings-load-settings-sync', function (event) {
        // eslint-disable-next-line no-param-reassign
        event.returnValue = loadSettingsSync();
    });
    ipcMain.handle('electron-settings-save-settings', function (event, obj) {
        return saveSettings(obj);
    });
    ipcMain.on('electron-settings-save-settings-sync', function (event, obj) {
        saveSettingsSync(obj);
    });
}
/**
 * Returns the path to the settings file.
 *
 * In general, the settings file is stored in your app's
 * user data directory in a file called `settings.json`.
 * The default user data directory varies by system.
 *
 * - **macOS** - `~/Library/Application\ Support/<Your App>`
 * - **Windows** - `%APPDATA%/<Your App>`
 * - **Linux** - Either `$XDG_CONFIG_HOME/<Your App>` or
 * `~/.config/<Your App>`
 *
 * Although it is not recommended, you may change the name
 * or location of the settings file using
 * [[configure|configure()]].
 *
 * @returns The path to the settings file.
 * @example
 *
 * Get the path to the settings file.
 *
 *     settings.file();
 *     // => /home/nathan/.config/MyApp/settings.json
 */
function file() {
    return getSettingsFilePath();
}
/**
 * Sets the configuration for Electron Settings. To reset
 * to defaults, use [[reset|reset()]].
 *
 * Defaults:
 *
 *     {
 *       atomicSave: true,
 *       fileName: 'settings.json',
 *       numSpaces: 2,
 *       prettify: false
 *     }
 *
 * @param customConfig The custom configuration to use.
 * @example
 *
 * Update the filename to `cool-settings.json` and prettify
 * the output.
 *
 *     settings.configure({
 *       fileName: 'cool-settings.json',
 *       prettify: true
 *     });
 */
function configure(customConfig) {
    config = __assign(__assign({}, config), customConfig);
}
/**
 * Resets the Electron Settings configuration to defaults.
 *
 * @example
 *
 * Reset configuration to defaults.
 *
 *     settings.reset();
 */
function reset() {
    config = __assign({}, defaultConfig);
}
/**
 * Checks if the given key path exists. For sync,
 * use [[hasSync|hasSync()]].
 *
 * @category Core
 * @param keyPath The key path to check.
 * @returns A promise which resolves to `true` if the
 * `keyPath` exists, else `false`.
 * @example
 *
 * Check if the value at `color.name` exists.
 *
 *     // Given:
 *     //
 *     // {
 *     //   "color": {
 *     //     "name": "cerulean",
 *     //     "code": {
 *     //       "rgb": [0, 179, 230],
 *     //       "hex": "#003BE6"
 *     //     }
 *     //   }
 *     // }
 *
 *     const exists = await settings.has('color.name');
 *     // => true
 *
 * @example
 *
 * Check if the value at `color.hue` exists.
 *
 *     const h = 'hue';
 *     const exists = await settings.has(['color', h]);
 *     // => false
 *
 *  @example
 *
 * Check if the value at `color.code.rgb[1]` exists.
 *
 *     const exists = await settings.has(color.code.rgb[1]);
 *     // => true
 */
function has(keyPath) {
    return __awaiter(this, void 0, void 0, function () {
        var obj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyLoadSettings()];
                case 1:
                    obj = _a.sent();
                    return [2 /*return*/, lodash_has_1.default(obj, keyPath)];
            }
        });
    });
}
/**
 * Checks if the given key path exists. For async,
 * use [[hasSync|hasSync()]].
 *
 * @category Core
 * @param keyPath The key path to check.
 * @returns `true` if the `keyPath` exists, else `false`.
 * @example
 *
 * Check if the value at `color.name` exists.
 *
 *     // Given:
 *     //
 *     // {
 *     //   "color": {
 *     //     "name": "cerulean",
 *     //     "code": {
 *     //       "rgb": [0, 179, 230],
 *     //       "hex": "#003BE6"
 *     //     }
 *     //   }
 *     // }
 *
 *     const exists = settings.hasSync('color.name');
 *     // => true
 *
 * @example
 *
 * Check if the value at `color.hue` exists.
 *
 *     const h = 'hue';
 *     const exists = settings.hasSync(['color', h]);
 *     // => false
 *
 * @example
 *
 * Check if the value at `color.code.rgb[1]` exists.
 *
 *     const exists = settings.hasSync(color.code.rgb[1]);
 *     // => true
 */
function hasSync(keyPath) {
    var obj = proxyLoadSettingsync();
    return lodash_has_1.default(obj, keyPath);
}
function get(keyPath) {
    return __awaiter(this, void 0, void 0, function () {
        var obj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyLoadSettings()];
                case 1:
                    obj = _a.sent();
                    if (keyPath) {
                        return [2 /*return*/, lodash_get_1.default(obj, keyPath)];
                    }
                    else {
                        return [2 /*return*/, obj];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function getSync(keyPath) {
    var obj = proxyLoadSettingsync();
    if (keyPath) {
        return lodash_get_1.default(obj, keyPath);
    }
    else {
        return obj;
    }
}
function set() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        var value, keyPath, value, obj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(args.length === 1)) return [3 /*break*/, 1];
                    value = args[0];
                    return [2 /*return*/, proxySaveSettings(value)];
                case 1:
                    keyPath = args[0], value = args[1];
                    return [4 /*yield*/, proxyLoadSettings()];
                case 2:
                    obj = _a.sent();
                    lodash_set_1.default(obj, keyPath, value);
                    return [2 /*return*/, proxySaveSettings(obj)];
            }
        });
    });
}
function setSync() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (args.length === 1) {
        var value = args[0];
        proxySaveSettingsSync(value);
    }
    else {
        var keyPath = args[0], value = args[1];
        var obj = proxyLoadSettingsync();
        lodash_set_1.default(obj, keyPath, value);
        proxySaveSettingsSync(obj);
    }
}
function unset(keyPath) {
    return __awaiter(this, void 0, void 0, function () {
        var obj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!keyPath) return [3 /*break*/, 2];
                    return [4 /*yield*/, proxyLoadSettings()];
                case 1:
                    obj = _a.sent();
                    lodash_unset_1.default(obj, keyPath);
                    return [2 /*return*/, proxySaveSettings(obj)];
                case 2: 
                // Unset all settings by saving empty object.
                return [2 /*return*/, proxySaveSettings({})];
            }
        });
    });
}
function unsetSync(keyPath) {
    if (keyPath) {
        var obj = proxyLoadSettingsync();
        lodash_unset_1.default(obj, keyPath);
        proxySaveSettingsSync(obj);
    }
    else {
        // Unset all settings by saving empty object.
        proxySaveSettingsSync({});
    }
}
module.exports = {
    init: init,
    file: file,
    configure: configure,
    reset: reset,
    has: has,
    hasSync: hasSync,
    get: get,
    getSync: getSync,
    set: set,
    setSync: setSync,
    unset: unset,
    unsetSync: unsetSync,
};
//# sourceMappingURL=settings.js.map