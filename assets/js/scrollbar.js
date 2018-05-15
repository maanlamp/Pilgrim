const itemlist = document.querySelector("#itemList");
const minimalDistance = 300;
const html = document.querySelector("html");

itemlist.addEventListener("scroll", event => {
	if (html.classList.contains("fullscreen")) return;
	const viewportBottom = itemlist.scrollTop + itemlist.clientHeight;
	const windowBottom = itemlist.scrollHeight;
	const distanceBetweenBottoms = windowBottom - viewportBottom;
	if (distanceBetweenBottoms < minimalDistance) {
		const factor = (minimalDistance - distanceBetweenBottoms) / minimalDistance * .6;
		itemlist.style.setProperty("--scrollbarBorderRadius", `${factor}rem`);
	}
	
	//if search() itemlist.style.setProperty("--scrollbarBorderRadius", 0);
});