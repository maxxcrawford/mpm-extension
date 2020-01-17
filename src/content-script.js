"use strict";

// TODO: On page, push notification to fix
// TODO: Add logic to only run specific recipie based on URL
// TODO: Use form to populate information
{

	console.log("content-script");

	const currentSiteHost = window.location;

	let userFillInfo = null;

	function getUserInfo() {
		console.log("getUserInfo");
		sendMessage("get-ccpa-info");
	}

	function dunkinDonutsCCPA() {
		console.log("dunkinDonutsCCPA", userFillInfo);
		let input = document.getElementById("RIGHT_TO_OPT_OUT_OPTIONS_1");
		let email = document.getElementById("emailInput");

		setTimeout(()=>{
			input.click();
		}, 50);
		setTimeout(()=>{
			email.focus();
			email.select();
			email.value = userFillInfo.email;
			email.blur();
		}, 100);

		const form = document.querySelector(".doNotSell__form");

		setTimeout(()=>{
			let submit = form.querySelector("input[type=submit]");
			submit.click();
			// form.submit();
		}, 150);

	}

	// let supportedSites = null;
	let supportedSites = [
		"https://www.dunkindonuts.com/en/consumer-rights",
		"https://www.facebook.com/settings?tab=facerec",
		"https://www.facebook.com/help/contact/784491318687824",
	];

	function setSupportedSitesArray(value) {
		if ( !supportedSites ) {
			supportedSites = value.response;
		}
	}

	function parseMessage(value){
		switch (value.message) {
			case "send-supported-sites":
				setSupportedSitesArray(value);
				break;
			case "send-ccpa-info":
				console.log("Message received: send-ccpa-info", value.response);
				userFillInfo = value.response;
				runRecipe(currentSiteHost)
				break;
				// console.log("parse: send-ccpa-info", value);
				// return supportedSites = value.response;
		}
	}

	function sendMessage(message) {
		if (!message) { throw new Error("No message to send") }
		let sending = browser.runtime.sendMessage({message: message});
		sending.then(value => {
			parseMessage(value);
		}, reason => {
			// rejection
			console.error(reason);
		});
	}


	function runRecipe(site) {
		console.log("runRecipe", site, userFillInfo);
		switch (site.host) {
			case "www.dunkindonuts.com":
				dunkinDonutsCCPA();
				break;
			default:
				console.error(`No recipe found for ${site}`);
				// throw new Error();
		}
	}

	getUserInfo();


}
