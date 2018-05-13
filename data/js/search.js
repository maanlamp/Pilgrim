const searchbar = document.querySelector("nav");
const input = searchbar.querySelector("input");
const itemList = document.querySelector("#itemList");
const { readdir, stat } = require("fs");
const nodePath = require("path");
const { promisify } = require("util");
const readDir = promisify(readdir);
const { app } = electron.remote;
const fs = require("fs");
const drivelist = require("drivelist");
const diskspace = require("diskspace");

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

function formatBytes (bytes, bitsOrBytes = "bytes") {
	bytes = Number(bytes);
	if (bytes === 1) return "1 Byte";
	const byteSizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
	const bitSizes = ["Bits", "KiB", "MiB", "GiB", "TiB", "PiB"];
	const sizes = (bitsOrBytes === "bytes") ? byteSizes : bitSizes;
	const factor = (bitsOrBytes === "bytes") ? 1024 : 1000;
	const sizeIndex = Math.floor(Math.log(bytes) / Math.log(factor));
	return `${(bytes / (factor ** sizeIndex)).toFixed()} ${sizes[sizeIndex]}`;
}

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
		const ext = nodePath.extname(path).replace(".", "").toLowerCase();
		fs.readFile("./data/json/icons.json", (err, data) => {
			if (err) reject(err);
			const json = JSON.parse(data);
			const src = json[ext];
			if (src) {
				resolve(src);
			} else {
				if (["png", "jpg", "jpeg", "webp", "tiff", "gif", "bmp", "svg"].includes(ext)) {
					resolve(path);
				}
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
	const button = document.querySelector("nav>#searchButtons>#refresh");
	button.classList.add("loading");
	button.title = "Loading";
	setTimeout(() => {
		button.classList.remove("loading");
		button.title = "Refresh";
	}, 3000);
	while (itemList.lastChild) {
		itemList.removeChild(itemList.lastChild);
	}

	if (windowLocation.slice(0, 6).toLowerCase() === "start:") {
		input.value = "";
		spanifySearchbar();
		drivelist.list((err, drives) => {
			if (err) throw err;
			for (const drive of drives) {
				const diskName = drive.mountpoints[0].path;
				const diskLetter = diskName.replace(/[/\\]/, "");
				const item = document.createElement("LI");
				const canvas = document.createElement("CANVAS");
				const ctx = canvas.getContext("2d");
				ctx.lineWidth = 12;
				ctx.font = "5rem Varela round";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.lineCap = "round";
				const title = document.createElement("H2");
				const description = document.createElement("P");
				title.textContent = drive.description;
				item.title = `${drive.description} (${diskLetter})`;
				description.textContent = "n/a available.";
				[canvas, title, description].forEach(element => item.appendChild(element));
				itemList.appendChild(item);
				const min = 1/5 * Math.PI;
				const max = (1+ 4/5) * Math.PI;
				const size = Math.min(canvas.width, canvas.height) / 2 - ctx.lineWidth;
				ctx.save();
				ctx.translate(canvas.width / 2, canvas.height / 2);
				ctx.rotate(1/2 * Math.PI);
				ctx.beginPath();
				ctx.strokeStyle = "#CDCDCD";
				ctx.arc(0, 0, size, min, max);
				ctx.stroke();
				ctx.restore();
				diskspace.check(diskName, (err, space) => {
					if (err) throw err;
					description.textContent = `${formatBytes(space.free)} / ${formatBytes(space.total)} available.`;
					ctx.save();
					ctx.translate(canvas.width / 2, canvas.height / 2);
					ctx.rotate(1/2 * Math.PI);
					ctx.beginPath();
					ctx.strokeStyle = `rgb(${getComputedStyle(document.querySelector(":root")).getPropertyValue("--windowTitlebarColour")})`;
					ctx.arc(0, 0, size, min, min + (space.used / space.total) * max);
					ctx.stroke();
					ctx.rotate(1/2 * -Math.PI);
					ctx.fillText(diskLetter, 0, 0);
					ctx.restore();
					item.addEventListener("click", () => {
						windowLocation = diskName;
						search();
					});
				});
			}
		});
		return;
	}

	if (!fs.existsSync(path)) { //If absolute search doesnt exist, try appending it to current path
		let temp = "";
		const spans = searchbar.querySelectorAll("span");
		for (const span of spans) {
			temp += `${span.textContent}\\`;
		}
		path = nodePath.join(temp, path);
		windowLocation = path;
		if (!fs.existsSync(path)) { //if still no match
			//Search
		}
	}

	input.value = "";
	spanifySearchbar();

	let files = await readDir(path);
	
	files.forEach((file, i) => {
		const fullpath = nodePath.join(path, file);
		const item = document.createElement("LI");
		const figure = document.createElement("FIGURE");
		const title = document.createElement("H2");
		title.textContent = file;
		item.title = file;
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

function bindClick (buttonCSSSelector, func) {
	const button = document.querySelector(buttonCSSSelector);
	func(button);
}

function bindAnimation (button, name) {
	button.addEventListener("click", event => {
		button.removeAttribute("style");
		button.style.animation = `${name} .2s ease-out`;
	});
	button.addEventListener("animationend", event => {
		button.removeAttribute("style");
	});
}

bindClick("nav #back", button => {
	bindAnimation(button, "back");
});
bindClick("nav #forward", button => {
	bindAnimation(button, "forward");
});
bindClick("nav #dirUp", button => {
	bindAnimation(button, "dirUp");
	button.addEventListener("click", () => {
		windowLocation = nodePath.dirname(windowLocation);
		search();
	});
});
document.querySelector("nav #refresh").addEventListener("click", event => {
	search();
});