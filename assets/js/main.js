"use strict";

//requires
const fs = require("fs");
const { promisify } = require("util");
const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const prototypeExtensions = {
	array: require("prototype-extensions/compiled/Array.js"),
	string: require("prototype-extensions/compiled/String.js")
}
const { Query } = require("./assets/js/Query.js");
const { PilgrimItem } = require("./assets/js/PilgrimItem.js");

function startLoadingAnimation () {
	const refreshButton = document.querySelector("nav>#searchButtons>#refresh");
	refreshButton.classList.add("loading");
	refreshButton.title = "Loading...";
}

function stopLoadingAnimation () {
	const refreshButton = document.querySelector("nav>#searchButtons>#refresh");
	refreshButton.classList.remove("loading");
	refreshButton.title = "Refresh";
}

function clearHTMLBreadcrumbs () {
	const rootCrumb = document.querySelector("#breadcrumbs>#root");
	const dirCrumbs = document.querySelector("#breadcrumbs>#dir");
	const baseCrumb = document.querySelector("#breadcrumbs>#base");
	[rootCrumb, dirCrumbs, baseCrumb].forEach(crumbList => {
		while (crumbList.lastChild) {
			crumbList.removeChild(crumbList.lastChild);
		}
	});
}

function updateHTMLBreadcrumbs (crumbs) {
	const rootCrumb = document.querySelector("#breadcrumbs>#root");
	const dirCrumbs = document.querySelector("#breadcrumbs>#dir");
	const baseCrumb = document.querySelector("#breadcrumbs>#base");
	clearHTMLBreadcrumbs();
	rootCrumb.textContent = crumbs.first();
	if (crumbs.length > 1) baseCrumb.textContent = crumbs.last();
	if (crumbs.length > 2) {
		crumbs.slice(1, -1).forEach(crumb => {
			const div = document.createElement("DIV");
			div.textContent = crumb;
			dirCrumbs.appendChild(div);
		});
	}
}

async function getFilesAndFolders (path) {
	const items = await readDir(path);
	const filesAndFolders = [];
	for (const item of items) {
		const fullPath = `${path}/${item}`;
		filesAndFolders.push(PilgrimItem.buildFrom(fullPath));
	}
	return filesAndFolders;
}

function sortArraysBy (arrays, property) {
	arrays.forEach(array => {
		array.sort((a, b) => {
			const valA = a[property].toLower();
			const valB = b[property].toLower();
			if (valA === valB) return 0;
			return -1 + (valA > valB) * 2;
		});
	});
}

async function walk (location) {
	const items = (await Promise.all(await getFilesAndFolders(location)));
	const files = items.filter(item => item.constructor.name.toLower().includes("file"));
	const folders = items.filter(item => item.constructor.name.toLower().includes("folder"));
	sortArraysBy([files, folders], "name");
	return {files: files, folders: folders};
}

function clearItemList () {
	const itemList = document.querySelector("#itemList");
	while (itemList.lastChild) {
		itemList.removeChild(itemList.lastChild);
	}
}

async function fillItemList (arrayOfArrays) {
	const folderImageSVG = (await readFile("./assets/images/icons/directory.svg", "utf8")).replace(/[\r\n\t\f\v]/g, "");
	const promises = [];
	arrayOfArrays.forEach(array => {
		array.forEach(async (item, i) => {
			const li = document.createElement("LI");
			const figure = li.appendChild(document.createElement("FIGURE"));
			if (item.isDirectory) {
				figure.insertAdjacentHTML("afterbegin", folderImageSVG);
			} else {
				const image = figure.appendChild(document.createElement("IMG"));
				promises.push(new Promise((resolve, reject) => {
					image.src = "./inspirationaise/windows_explorer_concept_-_800x600.jpg";
					image.addEventListener("load", () => {
						resolve();
					});
				}));
			}
			const name = li.appendChild(document.createElement("H2"));
			name.textContent = item.name;
			const description = li.appendChild(document.createElement("P"));
			/*
			if (item.isDirectory) {
				const subItems = await search(item.fullPath);
				console.log(item.fullPath);
				const subItemCount = subItems.folders.length + subItems.files.length;
				description.textContent = (subItemCount > 0) ? `${subItemCount} subitems` : "Empty folder";
			} else {
				description.textContent = `${item.stats.size} bytes`;
			}
			*/
			description.textContent = (item.isDirectory) ? "Folder" : `${item.stats.size} bytes`;
			li.addEventListener("click", event => {
				//search
			});
			itemList.appendChild(li);
		});
	});
	return Promise.all(promises);
}

const input = document.querySelector("#searchbar>input");
input.addEventListener("keyup", async event => {
	if (event.key === "Enter") { //Search
		startLoadingAnimation();

		const query = new Query(input.value);
		const path = (await query.isValid) ? query.raw : await query.validPart;

		updateHTMLBreadcrumbs(Query.crumbifyPath(path));

		const { files, folders } = await walk(path);
		input.value = path;

		clearItemList();
		await fillItemList([folders, files]);

		stopLoadingAnimation();
	} else { //Path IntelliSense
		//
	}
});