"use strict"

const nodePath = require("path");

function checkExistenceOf (path) {
	return new Promise((resolve, reject) => {
		fs.access(path, err => {
			if (err) {
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});
}

exports.Query = class Query {
	constructor (path) {
		this.raw = Query.normalisePath(path);
	}

	static normalisePath (path, delimiter = "/") {
		return nodePath.normalize(
			(path.lastChar() === ":")
			? `${path}${delimiter}`
			: path
		).replace(/[/\\]+/g, delimiter);
	}

	static crumbifyPath (path, delimiter = /[/\\]/) {
		return path.split(delimiter).filter(crumb => crumb !== "");
	}
	
	get isValid () {
		return new Promise(async (resolve, reject) => {
			resolve(await checkExistenceOf(this.raw));
		});
	}

	get validPart () {
		return new Promise(async (resolve, reject) => {
			const validChunks = [];
			const breadcrumbs = Query.crumbifyPath(this.raw);
			for (const crumb of breadcrumbs) {
				const tempPath = validChunks.concat(crumb).join("/");
				if (! await checkExistenceOf(tempPath)) break;
				validChunks.push(crumb);
			}
			resolve(`${validChunks.join("/")}/`);
		});
	}
}