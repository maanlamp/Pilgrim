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
const electron = require("electron");
const { app } = electron.remote;

function setupLoadingAnimation () {
	const refreshButton = document.querySelector("nav>#searchButtons>#refresh");
	refreshButton.addEventListener("animationiteration", () => {
		setTimeout(() => {
			if (refreshButton.className === "end") {
				refreshButton.classList.remove("end");
			}
		}, 1000);
		if (refreshButton.classList.contains("end")) {
			refreshButton.classList.remove("loading");
		}
		if (refreshButton.classList.contains("start")) {
			refreshButton.classList.remove("start");
			refreshButton.classList.add("loading");
		}
	});
}

function startLoadingAnimation () {
	const refreshButton = document.querySelector("nav>#searchButtons>#refresh");
	refreshButton.classList.add("start");
	refreshButton.title = "Loading...";
}

function stopLoadingAnimation () {
	const refreshButton = document.querySelector("nav>#searchButtons>#refresh");
	refreshButton.classList.add("end");
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
	if (crumbs.length > 2) {
		crumbs.slice(1, -1).forEach((crumb, i) => {
			const div = document.createElement("DIV");
			div.textContent = crumb;
			div.classList.add("crumb");
			dirCrumbs.appendChild(div);

		});
	}
	if (crumbs.length > 1) baseCrumb.textContent = crumbs.last();
	const allCrumbs = document.querySelectorAll("#breadcrumbs .crumb");
	allCrumbs.forEach((crumb, i) => {
		crumb.dataset.url = crumbs.slice(0, i + 1).join("/");
		crumb.onclick = () => {
			search(crumb.dataset.url);
		}
	});
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

function lookupIcon (path) {
	return new Promise((resolve, reject) => {
		app.getFileIcon(path, (err, icon) => {
			if (err) reject(err);
			resolve(icon.toDataURL());
		});
	});
}

async function updateItemList (arrayOfArrays) {
	clearItemList();
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
				if (item.mimeType && item.mimeType.includes("image")) {
					li.classList.add("containsImage");
					promises.push(new Promise((resolve, reject) => {
						image.src = item.fullPath;
						image.addEventListener("load", () => {
							resolve();
						});
					}));
				} else {
					promises.push(new Promise(async (resolve, reject) => {
						image.src = await lookupIcon(item.fullPath);
						image.addEventListener("load", () => {
							resolve();
						});
					}));
				}
			}
			const name = li.appendChild(document.createElement("H2"));
			name.textContent = item.name;
			li.title = item.name;
			const description = li.appendChild(document.createElement("P"));
			description.textContent = "Calculating size...";
			li.setAttribute("tabindex", "0");
			itemList.appendChild(li);
			try {
				//OFFLOAD THIS TO A WORKED BC IT'S SLOW AS FUQQ
				if (item.isDirectory) {
					const filesAndFolders = walk(item.fullPath);
					promises.push(filesAndFolders);
					const { files, folders } = await filesAndFolders;
					const fileCount = folders.length + files.length;
					description.textContent = `${(fileCount > 0) ? `${fileCount} subitem` : "Empty folder"}${(fileCount > 1) ? "s" : ""}`;
					li.addEventListener("click", event => {
						search(item.fullPath);
					});
				} else {
					description.textContent = `${item.stats.size} bytes`;
				}
			} catch (err) {
				li.classList.add("errOccured");
				description.textContent = err.code;
			}
		});
	});
	return Promise.all(promises);
}

async function search (string) {
	const query = new Query(string);
	const path = (await query.isValid) ? query.raw : await query.validPart;
	updateHTMLBreadcrumbs(Query.crumbifyPath(path));
	input.value = path;
	const { files, folders } = await walk(path);
	await updateItemList([folders, files]);
}

setupLoadingAnimation();
const input = document.querySelector("#searchbar>input");
input.addEventListener("keyup", async event => {
	if (event.key === "Enter") { //Search
		startLoadingAnimation();
		search(input.value);
		stopLoadingAnimation();
	} else { //Path IntelliSense
		//
	}
});