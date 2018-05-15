const tabbar = document.querySelector("#tabbar");

function rebuildTabs () {
	const someTabs = tabbar.querySelectorAll(".tab:not([tabindex]):not(.addTab)");
	const allTabs = tabbar.querySelectorAll(".tab");
	someTabs.forEach((tab, i) => {
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
			for (const tab of allTabs) {
				tab.classList.remove("open");
			}
			tab.classList.add("open");
			search(tab.dataset.url);
		};
	});
}

tabbar.querySelector(".addTab").addEventListener("click", event => {
	const tab = document.createElement("LI");
	tab.dataset.url = windowLocation || "Start:\\";
	tab.textContent = windowLocation || "Start"; //create naming function to filter slashes and get basename or smth
	tab.classList.add("tab");
	tabbar.insertBefore(tab, tabbar.lastElementChild);
	rebuildTabs();
	tab.click();
});