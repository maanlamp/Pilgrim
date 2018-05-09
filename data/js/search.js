const searchbar = document.querySelector("#search>input");
const itemList = document.querySelector("#itemList");
const { readdir, stat } = require("fs");
const nodePath = require("path");
const { promisify } = require("util");
const readDir = promisify(readdir);
const { app } = electron.remote;
const fs = require("fs");

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

async function search (path) {
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
	if (path.toLowerCase().includes("start")) return;
	const files = await readDir(searchbar.value);
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
					searchbar.value = fullpath;
					search(searchbar.value);
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
		itemList.appendChild(item);
	});
}

searchbar.addEventListener("keyup", event => {
	event.preventDefault();
	if (event.keyCode === 13) {
		search(searchbar.value);
	}
});