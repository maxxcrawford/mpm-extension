"use strict";

// TODO: On page, push notification to fix
{

	console.log("content-script");

	const currentSiteHost = window.location;

	let userFillInfo = null;
	let activeAction = null;

	function starbucksCCPA(site) {
		console.log("starbucksCCPA", site);

		if (site.href !== "https://privacyportal-cdn.onetrust.com/dsarwebform/f9975fc5-c93f-4ff8-8169-846d8f6cd4d2/dd7e8c8f-839f-4be3-9ebc-060786941e92.html") {
			console.log("not-starbucksCCPA");
			return;
		}

		function watchForSubmission() {
			if ( document.getElementById("formSubmitSuccessModal").style.display !== "block" ){
				setTimeout(()=>{
					watchForSubmission();
				}, 1000);
			} else {
				// overlay.updateProgressBar("100%");
				// overlay.updateText("Complete");
				setTimeout(()=>{
					sendMessage({
						message: "close-current-tab",
						action: "dataRequest",
						status: "pending"
					});
				}, 1000)
			}
		}

		// overlay.create();
		// overlay.addText("In Progress");

		let input1 = document.querySelector("label[aria-label='Right to Access']");
		let inputFirstName = document.getElementById("firstNameDSARElement");
		let inputLastName = document.getElementById("lastNameDSARElement");
		let inputEmail = document.getElementById("emailDSARElement");
		// let email = document.getElementById("emailInput");

		console.log(input1);

		setTimeout(()=>{
			input1.click();
			// overlay.updateProgressBar("20%");
		}, 500);

		setTimeout(()=>{
			inputFirstName.focus();
			inputFirstName.select();
			inputFirstName.value = userFillInfo.firstName;
			inputFirstName.blur();
			// overlay.updateProgressBar("40%");
		}, 500);

		setTimeout(()=>{
			inputLastName.focus();
			inputLastName.select();
			inputLastName.value = userFillInfo.lastName;
			inputLastName.blur();
			// overlay.updateProgressBar("60%");
		}, 500);

		setTimeout(()=>{
			inputEmail.focus();
			inputEmail.select();
			inputEmail.value = userFillInfo.email;
			inputEmail.blur();
			// overlay.updateProgressBar("80%");
		}, 500);






	}

	function dunkinDonutsCCPA(site) {
		console.log("dunkinDonutsCCPA", userFillInfo);

		if (site.href !== "https://www.dunkindonuts.com/en/consumer-rights") {
			console.log("not-dunkinDonutsCCPA");
			return;
		}



		overlay.create();
		overlay.addText("In Progress");

		// let overlay = document.querySelector(".mpm-body-loader-bar");

		console.log("dunkinDonutsCCPA-init");

		function watchForSubmission() {
			if ( document.getElementById("formSubmitSuccessModal").style.display !== "block" ){
				setTimeout(()=>{
					watchForSubmission();
				}, 1000);
			} else {
				overlay.updateProgressBar("100%");
				overlay.updateText("Complete");
				setTimeout(()=>{
					sendMessage({
						message: "close-current-tab",
						action: "doNotSell",
						status: "pending"
					});
				}, 1000)
			}
		}

		let input1 = document.getElementById("parent_1_option_1");
		let input = document.getElementById("RIGHT_TO_OPT_OUT_OPTIONS_1");
		let email = document.getElementById("emailInput");

		setTimeout(()=>{
			input1.click();
			input.click();
			overlay.updateProgressBar("33%");
		}, 500);
		setTimeout(()=>{
			email.focus();
			email.select();
			email.value = userFillInfo.email;
			email.blur();
			overlay.updateProgressBar("66%");
		}, 500);

		const form = document.querySelector(".doNotSell__form");

		setTimeout(()=>{
			watchForSubmission();
			overlay.updateProgressBar("88%");
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

	const overlay = {
		addText(message) {
			let messageContainer = document.createElement("div");
			messageContainer.className = "mpm-body-overlay-message";
			messageContainer.innerText = message;
			document.querySelector(".mpm-body-overlay").insertAdjacentElement(
				"afterbegin", messageContainer
			);
		},
		addURL(url, title) {
			if ( !document.querySelector(".mpm-body-overlay-message") ) {
				throw new Error("No message set. Add message first.");
			}
			// console.log(url.host);
			let link = document.createElement("a");
			link.className = "mpm-body-overlay-link";
			link.href = url.origin;

			if (title) {
				link.innerText = title
			} else {
				link.innerText = url.host;
			}

			document.querySelector(".mpm-body-overlay-message").insertAdjacentElement(
				"beforeend", link
			);
		},
		hide() {
			let overlay = document.createElement("mpm-body-overlay");
			overlay.style.display = "none";
		},
		create() {
			let overlay = document.createElement("div");
			overlay.className = "mpm-body-overlay"
			document.querySelector("html").insertAdjacentElement("afterbegin", overlay);

			let loaderBar = document.createElement("div");
			loaderBar.className = "mpm-body-loader-bar"
			document.querySelector(".mpm-body-overlay").insertAdjacentElement("afterbegin", loaderBar);
		},
		updateProgressBar(percent){
			if (!percent) {
				throw new Error("No percent set!");
			}
			let loaderBar = document.querySelector(".mpm-body-loader-bar")
			console.log(loaderBar, percent);
			loaderBar.style.width = percent;
		},
		updateText(message) {
			console.log("updateText");
			if (!document.querySelector(".mpm-body-overlay-message")){
				throw new Error("No message available to update");
			}
			document.querySelector(".mpm-body-overlay-message").innerText = message;
		}
	}

	function facebookAIOptOut(site) {
		console.log(site.href);

		if (site.href !== "https://www.facebook.com/settings?tab=facerec") {
			console.log("not-facebookAIOptOut");
			return;
		}

		if ( document.querySelector("h1").textContent.includes("Sorry") ) {
			overlay.create();
			overlay.addText("Not logged in!");
			overlay.addURL("window.location")
			return;
		}

		overlay.create();
		overlay.addText("In Progress");

		// let overlay = document.querySelector(".mpm-body-loader-bar");
		// console.log(overlay);

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
				overlay.updateProgressBar("100%");
				overlay.updateText("Completed");

				setTimeout( () => {
					sendMessage({
						message: "close-current-tab",
						action: "facialRecognition",
						status: "pending"
					});
				}, 1000);
			}


		}

		function onboardingJourney() {
			setTimeout(()=>{
				let onboarding = document.querySelector("div[aria-labelledby='gdpr_panel_header_text']");
				if (onboarding) {
					let onboardingButton = onboarding.querySelector("button");
					onboardingButton.click();
					overlay.updateProgressBar("33%");
				}
			}, 750);

			setTimeout(()=>{
				let turnOffButtonWrapper = document.querySelector("div[data-testid='parent_deny_consent_button']");
				console.log(turnOffButtonWrapper);
				if (turnOffButtonWrapper) {
					let turnOffButton = turnOffButtonWrapper.querySelector("button");
					turnOffButton.click();
					overlay.updateProgressBar("66%");
				}
			}, 750);

			setTimeout(()=>{
				overlay.updateProgressBar("100%");
				sendMessage({ message:"close-current-tab" });
			}, 750);
		}

		function defaultJourney() {
			let editButton = document.querySelector(".fbSettingsListItemEditText");
			setTimeout(()=>{
				overlay.updateProgressBar("20%");
				editButton.click();
			}, 750);

			setTimeout(()=>{
				let fbSettingsListItem = document.querySelector(".fbSettingsListItem");
				let uiPopover = fbSettingsListItem.querySelector(".uiPopover");
				let dropdownButton = uiPopover.querySelector("a");
				dropdownButton.click();
				overlay.updateProgressBar("40%");
			}, 750);

			setTimeout(()=>{
				let uiContextualLayerPositioner = document.querySelector(".uiContextualLayerPositioner");
				let menu = uiContextualLayerPositioner.querySelector("ul");
				menu.lastChild.click();
				overlay.updateProgressBar("60%");
			}, 750);

			setTimeout(()=>{
				overlay.updateProgressBar("80%");
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
			case "privacyportal-cdn.onetrust.com":
				starbucksCCPA(site);
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
