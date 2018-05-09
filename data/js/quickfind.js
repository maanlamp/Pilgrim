const quickfind = document.querySelector("#quickFind");

function rebuildQuickfind () {
	const items = quickfind.querySelectorAll(".quickFindItem");
	items.forEach((item, i) => {
		item.setAttribute("tabindex", 0);
		item.addEventListener("click", event => {
			searchbar.value = item.dataset.url;
			search(searchbar.value);
		});
	});
}
rebuildQuickfind();