const electron = require("electron");
const { remote } = electron;
const { BrowserWindow } = remote;
const display = electron.screen;

const title = document.querySelector("h1#title");
title.textContent = document.querySelector("title").textContent;
title.addEventListener("animationend", () => {
	title.remove();
})

document.querySelector("#minimise").addEventListener("click", () => {
	const remoteWindow = remote.getCurrentWindow();
	remoteWindow.minimize();
});

document.querySelector("#maximise").addEventListener("click", () => {
	const remoteWindow = remote.getCurrentWindow();
	const appContainer = document.querySelector("#appContainer");
	const html = document.querySelector("html");
	appContainer.classList.toggle("fullscreen");
	html.classList.toggle("fullscreen");
	if (appContainer.classList.contains("fullscreen")) {
		remoteWindow.maximize();
	} else {
		remoteWindow.setSize(1000, 640);
		
	}
	remoteWindow.center();
});

document.querySelector("#close").addEventListener("click", () => {
	const remoteWindow = remote.getCurrentWindow();
	remoteWindow.close();
});