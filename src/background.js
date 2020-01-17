"use strict";
{

	console.log("background");

	// List of supported sites
	const supportedSites = [
		"https://www.dunkindonuts.com/en/consumer-rights",
		"https://www.facebook.com/settings?tab=facerec",
		"https://www.facebook.com/help/contact/784491318687824",
	];

	const syncData = null;

	let userInfo = null;

	function saveUserInfo(formInfo) {
		console.log("saveUserInfo", formInfo);
		// browser.storage.local.set({
		// 	formInfo
		// });
		browser.storage.sync.set({
	    formInfo
	  });
	}

	async function getUserInfo() {
		console.log("getUserInfo");
		let formInfo = await browser.storage.sync.get("formInfo");
		console.log(formInfo);
		let userInfo = formInfo.formInfo;
		console.log(userInfo);
		return userInfo;
	}

	async function syncUserInfo() {
		console.log("syncUserInfo");
		const storageInfo = browser.storage.sync.get("formInfo");
	  storageInfo.then((res) => {
	    console.log(res.formInfo);
	  });
	}

	async function messageCatcher(request, sender, sendResponse) {
		console.log("messageCatcher", request.message);
		console.log({request, sender, sendResponse});
		switch (request.message) {
			case "get-supported-sites":
				return Promise.resolve({
					message: "send-supported-sites",
					response: supportedSites
				});
			case "save-ccpa-info":
				saveUserInfo(request.formInfo);
				return Promise.resolve({
					message: "confirm-ccpa-info-saved",
					response: "received"
				});
			case "get-ccpa-info":
				console.log("get-ccpa-info");
				let tempInfo = await getUserInfo();
				console.log("tempInfo", tempInfo);
				// userInfo = getUserInfo();
				return Promise.resolve({
					message: "send-ccpa-info",
					response: tempInfo
				});
		}

	}

	browser.runtime.onMessage.addListener(messageCatcher);

	document.addEventListener('DOMContentLoaded', syncUserInfo);

// let syncData = {
// 	// If the shape of this data changes, bump this version number and creat a
// 	// migration function that references it
// 	version: 0,
// 	urlStatuses: [
// 		{
// 			url: "https://www.dunkindonuts.com/en/consumer-rights",
// 			status: "not done"
// 		},
// 		{
// 			url: "https://www.facebook.com/settings?tab=facerec",
// 			status: "not done"
// 		},
// 		{
// 			url: "https://www.facebook.com/help/contact/784491318687824",
// 			status: "not done"
// 		}
// 	]
// };

}
