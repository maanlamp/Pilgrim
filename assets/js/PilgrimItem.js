"use strict";

const { promisify } = require("util");
const fileStats = promisify(fs.stat);
const nodePath = require("path");

class PilgrimItem {
	constructor (path) {
		this.name = null;
		this.fullPath = null;
		this.stats = null;
		this.isDirectory = null;
	}

	static buildFrom (path) {
		return new Promise(async (resolve, reject) => {
			try {
				const stats = await fileStats(path);
				resolve((stats.isDirectory()) ? new PilgrimFolder(path, stats) : new PilgrimFile(path, stats));
			} catch (err) {
				resolve(new PilgrimItem(path));
			}
		});
	}
}

class PilgrimFile extends PilgrimItem {
	constructor (path, stats) {
		super(arguments);
		this.name = nodePath.basename(path);
		this.fullPath = path;
		this.stats = stats;
		this.isDirectory = stats.isDirectory();
	}
}

class PilgrimFolder extends PilgrimItem {
	constructor (path, stats) {
		super(arguments);
		this.name = nodePath.basename(path);
		this.fullPath = path;
		this.stats = stats;
		this.isDirectory = stats.isDirectory();
	}
}

exports.PilgrimItem = PilgrimItem;