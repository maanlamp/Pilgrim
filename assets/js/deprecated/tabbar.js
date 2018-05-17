const tabbar = document.querySelector("#tabbar");
const path = require("path");

class Tabs {
	static get all () {
		return tabbar.querySelectorAll(".tab:not(.addTab)");
	}
}

function rebuildTabs () {
	const allTabsButLast = tabbar.querySelectorAll(".tab:not([tabindex]):not(.addTab)");
	allTabsButLast.forEach((tab, i) => {
		tab.title = tab.dataset.url;
		const temp = tab.textContent;
		tab.firstChild.remove();
		const firstLetter = document.createElement("DIV");
		firstLetter.classList.add("tabFirstLetter");
		firstLetter.textContent = temp[0].toUpper();
		const rest = document.createElement("DIV");
		rest.textContent = temp.slice(1).toLower();
		rest.classList.add("tabRest");
		[firstLetter, rest].forEach(div => tab.appendChild(div));
		tab.setAttribute("tabindex", 0);
		tab.onclick = event => {
			for (const tab of Tabs.all) {
				tab.classList.remove("open");
			}
			tab.classList.add("open");
			search(tab.dataset.url);
		};
	});
}

function titleify (text) {
	const parsedPath = path.parse(text);
	return parsedPath.base || parsedPath.dir;
}

function renameTab (tab) {
	tab.dataset.url = windowLocation || "Start:/";
	tab.textContent = titleify(windowLocation || "Start:/");
}

function createTab () {
	const tab = document.createElement("LI");
	renameTab(tab);
	tab.classList.add("tab");
	tabbar.insertBefore(tab, tabbar.lastElementChild);
	rebuildTabs();
	tab.focus();
	tab.click();
}

tabbar.querySelector(".addTab").addEventListener("click", event => {
	createTab();
});

createTab();