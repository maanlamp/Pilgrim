const itemlist = document.querySelector("#itemList");
const minmialPercentage = .75;
const html = document.querySelector("html");

itemlist.addEventListener("scroll", event => {
	if (html.classList.contains("fullscreen")) return;
	const viewportBottom = itemlist.scrollTop + itemlist.clientHeight;
	const windowBottom = itemlist.scrollHeight;
	const scrollPercentage = viewportBottom / windowBottom;
	if (scrollPercentage > minmialPercentage) {
		const factor = (scrollPercentage - minmialPercentage) / (1 - minmialPercentage) * .6; //*.6 is needed bc 1rem somehow is different in js than in css
		itemlist.style.setProperty("--scrollbarBorderRadius", `${factor}rem`);
	}
	
	//if search() itemlist.style.setProperty("--scrollbarBorderRadius", 0);
});