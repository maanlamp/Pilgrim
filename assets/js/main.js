"use strict";

//requires
const fs = require("fs");
const { promisify } = require("util");
const readDir = promisify(fs.readdir);
const stats = promisify(fs.stat);
const prototypeExtensions = {
	array: require("prototype-extensions/compiled/Array.js"),
	string: require("prototype-extensions/compiled/String.js")
}
const { Query } = require("./assets/js/Query.js");

//HTMLElements
const input = document.querySelector("#searchbar>input");
const breadcrumbs = document.querySelector("#breadcrumbs");
const rootCrumb = breadcrumbs.querySelector("#root");
const dirCrumbs = breadcrumbs.querySelector("#dir");
const baseCrumb = breadcrumbs.querySelector("#base");
const refreshButton = document.querySelector("nav>#searchButtons>#refresh");

//"Global" variables

function startLoadingAnimation () {
	refreshButton.classList.add("loading");
	refreshButton.title = "Loading";
}

function stopLoadingAnimation () {
	refreshButton.classList.remove("loading");
	refreshButton.title = "Refresh";
}

function clearHTMLBreadcrumbs () {
	[rootCrumb, dirCrumbs, baseCrumb].forEach(crumbList => {
		while (crumbList.lastChild) {
			crumbList.removeChild(crumbList.lastChild);
		}
	});
}

function updateHTMLBreadcrumbs (crumbs) {
	clearHTMLBreadcrumbs();
	rootCrumb.textContent = crumbs.first();
	crumbs.slice(1, -1).forEach(crumb => {
		const div = document.createElement("DIV");
		div.textContent = crumb;
		dirCrumbs.appendChild(div);
	});
	baseCrumb.textContent = crumbs.last();
}

async function getFilesAndFolders (path) {
	const items = await readDir(path);
	const folders = [];
	const files = [];
	for (const item of items) {
		const itemStats = await stats(`${path}/${item}`);
		if (await itemStats.isDirectory()) {
			folders.push(item);
		} else {
			files.push(item);
		}
	}
	return {files: files, folders: folders};
}

input.addEventListener("keyup", async event => {
	if (event.key === "Enter") { //Search
		startLoadingAnimation();

		const query = new Query(input.value);
		let path = query.raw;
		if (!await query.isValid) {
			path = await query.validPart;
		}
		updateHTMLBreadcrumbs(Query.crumbifyPath(path));
		
		const {files, folders} = await getFilesAndFolders(path);
		[files, folders].forEach(array => {
			array.sort((a, b) => {
				a = a.toLower();
				b = b.toLower();
				if (a === b) return 0;
				return -1 + (a > b) * 2;
			});
		});
		console.log(folders, files);

		stopLoadingAnimation();
	} else { //Path IntelliSense
		//
	}
});