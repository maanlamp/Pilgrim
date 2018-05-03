const { remote } = require("electron");

document.querySelector("#minimise button").addEventListener("click", () => {
	const window = remote.getCurrentWindow();
	window.minimize();
});

document.querySelector("#maximise button").addEventListener("click", () => {
	const window = remote.getCurrentWindow();
	console.log(window.isMaximized(), window.isFullScreen());
	if (window.isMaximized()) {
		window.unmaximize();
	} else {
		window.maximize();
	}
});

document.querySelector("#close button").addEventListener("click", () => {
	const window = remote.getCurrentWindow();
	window.close();
});