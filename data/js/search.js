const searchbar = document.querySelector("#search");
const itemList = document.querySelector("#itemList");
const fs = require("fs");
const nodePath = require("path");
const { promisify } = require("util");
const readDir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function search (path) {
	while (itemList.lastChild) {
		itemList.removeChild(itemList.firstChild);
	}
	const files = await readDir(searchbar.value);
	files.forEach(async (file, i) => {
		const item = document.createElement("LI");
		const img = document.createElement("IMG");
		img.src = "./data/images/maximise.png";
		const title = document.createElement("H2");
		title.textContent = file;
		const description = document.createElement("P");
		const stats = await stat(nodePath.join(path, file));
		const isDirectory = stats.isDirectory();
		description.textContent = (isDirectory) ? "Directory" : "File";
		[img, title, description].forEach(element => item.appendChild(element));
		itemList.appendChild(item);
		if (isDirectory) {
			item.addEventListener("click", () => {
				searchbar.value = nodePath.join(path, file);
				search(searchbar.value);
			});
		}
	});
}

searchbar.addEventListener("keyup", event => {
	event.preventDefault();
	if (event.keyCode === 13) {
		search(searchbar.value);
	}
});