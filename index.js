const electron = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs");
const { app, BrowserWindow } = electron;

app.on("ready", () => {
	const mainWindow = new BrowserWindow({
		transparent: true,
		frame: false
	});
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, "index.html"),
		protocol: "file:",
		slashes: true
	}));

	//mainWindow.setMenu(null);
	//mainWindow.webContents.openDevTools();
});