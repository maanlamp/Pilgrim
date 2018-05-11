const searchbar = document.querySelector("#search>#searchbar");
const input = searchbar.querySelector("input");
const itemList = document.querySelector("#itemList");
const { readdir, stat } = require("fs");
const nodePath = require("path");
const { promisify } = require("util");
const readDir = promisify(readdir);
const { app } = electron.remote;
const fs = require("fs");

Object.defineProperty(Array.prototype, "remove", {
	value: function remove (from, to) {
		if (!to) to = from + 1;
		this.splice(from, to);
		return this;
	}
});

Object.defineProperty(Array.prototype, "clone", {
	value: function clone (from, to) {
		return this.slice();
	}
});

function spanifySearchbar (splitOn = /[/\\]/) {
	let query = windowLocation;
	if (query.slice(-1).search(splitOn) > -1) query = query.slice(0, -1);
	const searchbarSpans = searchbar.querySelector("#searchbarSpans");
	const spans = searchbarSpans.querySelectorAll("span");
	for (const span of spans) {
		span.remove();
	}
	const substrings = query.split(splitOn);
	const chunks = substrings.clone().reverse();
	for (const chunk of chunks) {
		const span = document.createElement("SPAN");
		const regex = new RegExp(`.*${chunk}`, "i");
		span.dataset.url = query.match(regex)[0];
		span.title = span.dataset.url;
		span.textContent = chunk;
		span.setAttribute("tabindex", 0);
		span.addEventListener("click", event => {
			windowLocation = span.dataset.url;
			search();
		});
		searchbarSpans.prepend(span);
	}
}

function lookupIcon (path, img) {
	return new Promise((resolve, reject) => {
		const ext = nodePath.extname(path).replace(".", "");
		fs.readFile("./data/json/icons.json", (err, data) => {
			if (err) reject(err);
			const json = JSON.parse(data);
			const src = json[ext];
			if (src) {
				resolve(src);
			} else {
				app.getFileIcon(path, (err, icon) => {
					if (err) console.error(err);
					resolve(icon.toDataURL());
				});
			}
		});
	});
}

let windowLocation = "";
async function search (path = `${windowLocation}\\`) {
	const button = document.querySelector("#search>#searchButtons>#refresh");
	button.classList.add("loading");
	button.title = "Loading";
	setTimeout(() => {
		button.classList.remove("loading");
		button.title = "Refresh";
	}, 3000);
	while (itemList.lastChild) {
		itemList.removeChild(itemList.lastChild);
	}
	
	if (path.toLowerCase().includes("start")) return; //Implement start screen
	
	if (!fs.existsSync(path)) {
		let temp = "";
		const spans = searchbar.querySelectorAll("span");
		for (const span of spans) {
			temp += `${span.textContent}\\`;
		}
		path = nodePath.join(temp, path);
		windowLocation = path;
	}
	let files = await readDir(path);
	input.value = "";
	spanifySearchbar();
	
	files.forEach((file, i) => {
		const fullpath = nodePath.join(path, file);
		const item = document.createElement("LI");
		const figure = document.createElement("FIGURE");
		const title = document.createElement("H2");
		title.textContent = file;
		const description = document.createElement("P");
		const stats = stat(fullpath, (err, stats) => {
			const isDirectory = stats.isDirectory();
			description.textContent = (isDirectory) ? "Directory" : "File";
			if (isDirectory) {
				item.addEventListener("click", () => {
					windowLocation = fullpath;
					search();
				});
				fs.readFile("./data/images/icons/directory.svg", (err, data) => {
					if (err) throw err;
					figure.innerHTML = data;
				});
			} else {
				const img = document.createElement("IMG");
				figure.appendChild(img);
				lookupIcon(fullpath).then(src => img.src = src);
			}
		});
		[figure, title, description].forEach(element => item.appendChild(element));
		item.setAttribute("tabindex", 0);
		itemList.appendChild(item);
	});
}

input.addEventListener("keyup", event => {
	event.preventDefault();
	if (event.keyCode === 13) {
		windowLocation = input.value;
		search();
	}
});