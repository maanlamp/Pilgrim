document.addEventListener("keyup", event => {
	if (event.key !== "Enter" || document.activeElement === document.body || document.activeElement.tagName === "BUTTON") return;
	document.activeElement.click();
});