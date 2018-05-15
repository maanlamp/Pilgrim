document.addEventListener("keyup", event => {
	if (event.key !== "Enter" || document.activeElement === document.body) return;
	document.activeElement.click();
});