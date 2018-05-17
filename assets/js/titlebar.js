"use strict"

const electron = require("electron");
const { remote } = electron;
const { BrowserWindow } = remote;
const display = electron.screen;
let prevSize;
let prevPos;

const title = document.querySelector("h1#title");
title.textContent = document.querySelector("title").textContent;
title.addEventListener("animationend", () => {
	title.remove();
})

document.querySelector("#minimise").addEventListener("click", () => {
	const remoteWindow = remote.getCurrentWindow();
	remoteWindow.minimize();
});

//Had to manually set size and pos bc unmaximize didn't work.
document.querySelector("#maximise").addEventListener("click", () => {
	const remoteWindow = remote.getCurrentWindow();
	const appContainer = document.querySelector("#appContainer");
	const html = document.querySelector("html");
	appContainer.classList.toggle("fullscreen");
	html.classList.toggle("fullscreen");
	if (appContainer.classList.contains("fullscreen")) {
		prevSize = remoteWindow.getSize();
		prevPos = remoteWindow.getPosition();
		remoteWindow.maximize();
	} else {
		remoteWindow.setSize(prevSize[0] || 1000, prevSize[1] || 640);
		if (prevPos) {
			remoteWindow.setPosition(prevPos[0], prevPos[1]);
		} else {
			remoteWindow.center();
		}
	}
});

document.querySelector("#close").addEventListener("click", () => {
	const remoteWindow = remote.getCurrentWindow();
	remoteWindow.close();
});