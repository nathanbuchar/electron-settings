'use strict';

const encryptjs = require('encryptjs');
const fs = require('fs-extra');

export function outputEncryptedJson(filePath, obj, key, callback) {
	fs.writeFile(filePath, encryptjs.encrypt(JSON.stringify(obj), key, 256), callback);
}

export function readEncryptedJson(filePath, key, callback) {
	fs.readFile(filePath, (err, ciphertext) => {
			if(err) callback(err, null);
			else callback(err, JSON.parse(encryptjs.decrypt(ciphertext, key, 256)));
	});
}

export function outputEncryptedJsonSync(filePath, obj, key) {
	fs.writeFileSync(filePath, encryptjs.encrypt(JSON.stringify(obj), key, 256));
}

export function readEncryptedJsonSync(filePath, key) {
	return JSON.parse(encryptjs.decrypt(fs.readFileSync(filePath), key, 256));
}
