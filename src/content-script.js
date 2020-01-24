"use strict";

// TODO: On page, push notification to fix
{

	console.log("content-script");

	const currentSiteHost = window.location;

	let userFillInfo = null;



	function dunkinDonutsCCPA() {
		console.log("dunkinDonutsCCPAv2", userFillInfo);

		function watchForSubmission() {
			if ( document.getElementById("formSubmitSuccessModal").style.display !== "block" ){
				setTimeout(()=>{
					watchForSubmission();
				}, 1000);
			} else {
				sendMessage("close-current-tab");
			}
		}

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

	function facebookAIOptOut(site) {
		console.log(site.href);

		if (site.href !== "https://www.facebook.com/settings?tab=facerec") {
			console.log("not-facebookAIOptOut");
			return;
		}

		console.log("facebookAIOptOut");

		function watchForSubmission() {
			console.log("watchForSubmission");
			let closeButtonWrapper = document.querySelector(".fbSettingsListItem .content");
			let closeButton = closeButtonWrapper.querySelector("a");

			if ( !closeButton ){
				setTimeout(()=>{
					watchForSubmission();
				}, 1000);
			} else {
				closeButton.click();
				sendMessage("close-current-tab");
			}


		}

		function onboardingJourney() {
			setTimeout(()=>{
				let onboarding = document.querySelector("div[aria-labelledby='gdpr_panel_header_text']");
				if (onboarding) {
					let onboardingButton = onboarding.querySelector("button");
					onboardingButton.click();
				}
			}, 500);

			setTimeout(()=>{
				let turnOffButtonWrapper = document.querySelector("div[data-testid='parent_deny_consent_button']");
				console.log(turnOffButtonWrapper);
				if (turnOffButtonWrapper) {
					let turnOffButton = turnOffButtonWrapper.querySelector("button");
					turnOffButton.click();
				}
			}, 1000);

			setTimeout(()=>{
				sendMessage("close-current-tab");
			}, 500);
		}

		function defaultJourney() {
			let editButton = document.querySelector(".fbSettingsListItemEditText");
			setTimeout(()=>{
				editButton.click();
			}, 500);

			setTimeout(()=>{
				let fbSettingsListItem = document.querySelector(".fbSettingsListItem");
				let uiPopover = fbSettingsListItem.querySelector(".uiPopover");
				let dropdownButton = uiPopover.querySelector("a");
				dropdownButton.click();
			}, 750);

			setTimeout(()=>{
				let uiContextualLayerPositioner = document.querySelector(".uiContextualLayerPositioner");
				let menu = uiContextualLayerPositioner.querySelector("ul");
				menu.lastChild.click();
			}, 750);

			setTimeout(()=>{
				watchForSubmission();
			}, 750);

			setTimeout(()=>{
				// sendMessage("close-current-tab");
			}, 500);

		}

		setTimeout(()=>{
			let onboarding = document.querySelector("div[aria-labelledby='gdpr_panel_header_text']");

			if (onboarding) {
				onboardingJourney();
			} else {
				defaultJourney();
			}

		}, 500);


	}

	function runRecipe(site) {
		console.log("runRecipe", site, userFillInfo);
		switch (site.hostname) {
			case "www.facebook.com":
				facebookAIOptOut(site);
				break;
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
