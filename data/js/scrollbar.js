const itemlist = document.querySelector("#itemList");
const minimalDistance = 200;

itemlist.addEventListener("scroll", event => {
	const viewportBottom = itemlist.scrollTop + itemlist.clientHeight;
	const windowBottom = itemlist.scrollHeight;
	const distanceBetweenBottoms = windowBottom - viewportBottom;
	if (distanceBetweenBottoms < minimalDistance) {
		const factor = (minimalDistance - distanceBetweenBottoms) / minimalDistance * .425;
		itemlist.style.setProperty("--scrollbarBorderRadius", `${factor}rem`);
	}
	
	//if search() itemlist.style.setProperty("--scrollbarBorderRadius", 0);
});