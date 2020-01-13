"use strict";

const currentSiteHost = window.location.host;

function dunkinDonutsCCPA() {
	console.log("dunkinDonutsCCPA");
	// let input = document.getElementById("category_1");
	let input2 = document.getElementById("parent_1_option_1");
	let email = document.getElementById("emailInput");

	// setTimeout(()=>{
	// 	input.click();
	// }, 2000);
	setTimeout(()=>{
		input2.click();
	}, 500);
	setTimeout(()=>{
		email.focus();
		email.select();
		email.value = "maxx.crawford+8@gmail.com";
		email.blur();
	}, 1000);

	const form = document.querySelector(".doNotSell__form");

	console.log(form);

	setTimeout(()=>{
		let submit = form.querySelector("input[type=submit]");
		console.log(submit);
		submit.click();
		// form.submit();
	}, 2000);

	setTimeout(()=>{
		console.log("iframe-test2");

		let recaptchaIframe = document.querySelector('[title="recaptcha challenge"]');
		console.log(recaptchaIframe);
		console.log("done1");
		console.log(recaptchaIframe.contentDocument);
		console.log("done2");
		console.log(recaptchaIframe.contentWindow);
		console.log("done3");

		// document.querySelector('[title="recaptcha challenge"]').contentWindow.document.getElementById("recaptcha-audio-button").click()
		// form.submit();
	}, 5000);

}

const supportedSites = [
	"www.dunkindonuts.com"
];

function runRecipe(site) {
	switch (site) {
		case "www.dunkindonuts.com":
			dunkinDonutsCCPA();
			break;
		default:
			console.error(`No recipe found for ${site}`);
			// throw new Error();
	}
}

(function () {
	// Init
	console.log("content-script: ", currentSiteHost);
	runRecipe(currentSiteHost);
	if ( supportedSites.includes(currentSiteHost) ) {
		runRecipe(currentSiteHost);
	}
})();


// TODO: On page, push notification to fix

// TODO: Add logic to only run specific recipie based on URL

// TODO: Use form to populate information
