const quickfind = document.querySelector("#quickFind");

function rebuildQuickfind () {
	const items = quickfind.querySelectorAll(".quickFindItem");
	items.forEach((item, i) => {
		item.setAttribute("tabindex", 0);
		item.addEventListener("click", event => {
			windowLocation = item.dataset.url;
			search();
		});
	});
}
rebuildQuickfind();