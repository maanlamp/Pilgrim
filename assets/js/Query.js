"use strict"

exports.Query = class Query {
	constructor (path) {
		this.raw = path;
	}

	static checkExistenceOf (path) {
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

	static crumbifyPath (path, delimiter = /[/\\]/) {
		return path.split(delimiter).filter(crumb => crumb !== "");
	}
	
	get isValid () {
		return new Promise(async (resolve, rejcet) => {
			resolve(await Query.checkExistenceOf(this.raw));
		});
	}

	get validPart () {
		return new Promise(async (resolve, reject) => {
			const validChunks = [];
			const breadcrumbs = Query.crumbifyPath(this.raw);
			for (const crumb of breadcrumbs) {
				const tempPath = validChunks.concat(crumb).join("/");
				if (! await Query.checkExistenceOf(tempPath)) break;
				validChunks.push(crumb);
			}
			resolve(validChunks.join("/"));
		});
	}
}