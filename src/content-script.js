"use strict";

// TODO: On page, push notification to fix
{

	console.log("content-script");

	const currentSiteHost = window.location;

	let userFillInfo = null;
	let activeAction = null;

	function dunkinDonutsCCPA(site) {
		console.log("dunkinDonutsCCPA", userFillInfo);

		if (site.href !== "https://www.dunkindonuts.com/en/consumer-rights") {
			console.log("not-dunkinDonutsCCPA");
			return;
		}

		console.log("dunkinDonutsCCPA-init");

		sendMessage({
			message: "close-current-tab",
			action: "doNotSell",
			status: "pending"
		});

		function watchForSubmission() {
			if ( document.getElementById("formSubmitSuccessModal").style.display !== "block" ){
				setTimeout(()=>{
					watchForSubmission();
				}, 1000);
			} else {
				sendMessage({
					message: "close-current-tab",
					action: "doNotSell",
					status: "pending"
				});
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
		console.log("cs: ", value.message);
		switch (value.message) {
			case "panel-site-action-received":
				console.log("panel-site-action-received", value.action);
				activeAction = value.action
				break;

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

	function sendMessage(data) {
		if (!data.message) { throw new Error("No message to send") }
		let sending = browser.runtime.sendMessage(data);
		sending.then(value => {
			parseMessage(value);
		}, reason => {
			// rejection
			console.error(reason);
		});
	}

	function addOverlay(message, url) {
		console.log(message);
		let overlay = document.createElement("div");
		overlay.className = "mpm-body-overlay"
		document.querySelector("html").insertAdjacentElement("afterbegin", overlay);

		let loaderBar = document.createElement("div");
		loaderBar.className = "mpm-body-loader-bar"
		document.querySelector(".mpm-body-overlay").insertAdjacentElement("afterbegin", loaderBar);

		if (message) {
			let messageContainer = document.createElement("div");
			messageContainer.className = "mpm-body-overlay-message";
			messageContainer.innerText = message;
			document.querySelector(".mpm-body-overlay").insertAdjacentElement(
				"afterbegin", messageContainer
			);

			if (url) {
				console.log(url.host);
				let link = document.createElement("a");
				link.className = "mpm-body-overlay-link";
				link.href = url.origin;
				link.innerText = url.host;
				document.querySelector(".mpm-body-overlay-message").insertAdjacentElement(
					"beforeend", link
				);
			}
		}
	}

	function facebookAIOptOut(site) {
		console.log(site.href);

		if (site.href !== "https://www.facebook.com/settings?tab=facerec") {
			console.log("not-facebookAIOptOut");
			return;
		}

		if ( document.querySelector("h1").textContent.includes("Sorry") ) {
			addOverlay("Not logged in!", window.location);
			return;
		}

		addOverlay("In Progress");
		let overlay = document.querySelector(".mpm-body-loader-bar");
		console.log(overlay);

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
				overlay.style.width = "100%";
				sendMessage({
					message: "close-current-tab",
					action: "facialRecognition",
					status: "pending"
				});
			}


		}

		function onboardingJourney() {
			setTimeout(()=>{
				let onboarding = document.querySelector("div[aria-labelledby='gdpr_panel_header_text']");
				if (onboarding) {
					let onboardingButton = onboarding.querySelector("button");
					onboardingButton.click();
					overlay.style.width = "33%";
				}
			}, 750);

			setTimeout(()=>{
				let turnOffButtonWrapper = document.querySelector("div[data-testid='parent_deny_consent_button']");
				console.log(turnOffButtonWrapper);
				if (turnOffButtonWrapper) {
					let turnOffButton = turnOffButtonWrapper.querySelector("button");
					turnOffButton.click();
					overlay.style.width = "66%";
				}
			}, 750);

			setTimeout(()=>{
				overlay.style.width = "100%";
				sendMessage({ message:"close-current-tab" });
			}, 750);
		}

		function defaultJourney() {
			let editButton = document.querySelector(".fbSettingsListItemEditText");
			setTimeout(()=>{
				overlay.style.width = "20%";
				editButton.click();
			}, 750);

			setTimeout(()=>{
				let fbSettingsListItem = document.querySelector(".fbSettingsListItem");
				let uiPopover = fbSettingsListItem.querySelector(".uiPopover");
				let dropdownButton = uiPopover.querySelector("a");
				dropdownButton.click();
				overlay.style.width = "40%";
			}, 750);

			setTimeout(()=>{
				let uiContextualLayerPositioner = document.querySelector(".uiContextualLayerPositioner");
				let menu = uiContextualLayerPositioner.querySelector("ul");
				menu.lastChild.click();
				overlay.style.width = "60%";
			}, 750);

			setTimeout(()=>{
				overlay.style.width = "80%";
				watchForSubmission();
			}, 750);

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
				dunkinDonutsCCPA(site);
				break;
			default:
				console.error(`No recipe found for ${site}`);
				// throw new Error();
		}
	}
	sendMessage({message: "get-ccpa-info"});


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
