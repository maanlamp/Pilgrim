const menuItems = document.querySelectorAll("#menu>.menuItem");
menuItems.forEach((menuItem, i) => {
	const temp = menuItem.textContent;
	menuItem.firstChild.remove();
	const firstLetter = document.createElement("DIV");
	firstLetter.classList.add("menuItemFirstLetter");
	firstLetter.textContent = temp[0].toUpperCase();
	const rest = document.createElement("DIV");
	rest.textContent = temp.slice(1).toLowerCase();
	rest.classList.add("menuItemRest");
	[firstLetter, rest].forEach(div => menuItem.appendChild(div));
	menuItem.setAttribute("tabindex", 0);
});