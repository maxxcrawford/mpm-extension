"use strict";

// TODO: On page, push notification to fix
{

	console.log("content-script");

	const currentSiteHost = window.location;

	let userFillInfo = null;

	function watchForSubmission() {
		if ( document.getElementById("formSubmitSuccessModal").style.display !== "block" ){
			setTimeout(()=>{
				watchForSubmission();
			}, 1000);
		} else {
			sendMessage("close-current-tab");
		}
	}

	function dunkinDonutsCCPA() {
		console.log("dunkinDonutsCCPAv2", userFillInfo);
		let input1 = document.getElementById("parent_1_option_1");
		let input = document.getElementById("RIGHT_TO_OPT_OUT_OPTIONS_1");
		let email = document.getElementById("emailInput");

		setTimeout(()=>{
			input1.click();
			input.click();
		}, 500);
		setTimeout(()=>{
			email.focus();
			email.select();
			email.value = userFillInfo.email;
			email.blur();
		}, 500);

		const form = document.querySelector(".doNotSell__form");

		setTimeout(()=>{
			watchForSubmission();
			let submit = form.querySelector("input[type=submit]");
			submit.click();
		}, 500);

	}

	// let supportedSites = null;
	let supportedSites = null;

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
	sendMessage("get-ccpa-info");


	function messageCatcher(request, sender, sendResponse) {
		console.log("messageCatcher", {request, sender, sendResponse});
		switch (request.message) {
			case "panel-action-open":
				return Promise.resolve({
					message: "panel-action-open-received",
					response: "received"
				});
		}
	}

	browser.runtime.onMessage.addListener(messageCatcher);
}
