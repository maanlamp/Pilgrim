function rebuildTabs () {
	const tabs = document.querySelectorAll("#tabbar>.tab:not([tabindex])");
	tabs.forEach((tab, i) => {
		const temp = tab.textContent;
		tab.firstChild.remove();
		const firstLetter = document.createElement("DIV");
		firstLetter.classList.add("tabFirstLetter");
		firstLetter.textContent = temp[0].toUpperCase();
		const rest = document.createElement("DIV");
		rest.textContent = temp.slice(1).toLowerCase();
		rest.classList.add("tabRest");
		[firstLetter, rest].forEach(div => tab.appendChild(div));
		tab.setAttribute("tabindex", 0);
		tab.addEventListener("click", event => {
			windowLocation = tab.dataset.url;
			search();
		});
	});
}

rebuildTabs();