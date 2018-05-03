const { remote } = require("electron");

document.querySelector("#minimise").addEventListener("click", () => {
	const window = remote.getCurrentWindow();
	window.minimize();
});

document.querySelector("#maximise").addEventListener("click", () => {
	const window = remote.getCurrentWindow();
	console.log(window.isMaximized(), window.isFullScreen());
	document.querySelector("#titlebar").classList.toggle("fullscreen");
	if (window.isMaximized()) {
		window.unmaximize();
	} else {
		window.maximize();
	}
});

document.querySelector("#close").addEventListener("click", () => {
	const window = remote.getCurrentWindow();
	window.close();
});