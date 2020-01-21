"use strict";
{

	console.log("background");

	// List of supported sites
	const supportedSites = [
		"https://www.dunkindonuts.com/en/consumer-rights",
		"https://www.facebook.com/settings?tab=facerec",
		"https://www.facebook.com/help/contact/784491318687824",
		"sample-site",
		"sample-site2",
	];

	let userInfo = null;

	// If the shape of this data changes, bump this version number and creat a
	// migration function that references it
	const LATEST_DATA_VERSION = 0.3;

	function saveUserInfo(formInfo) {
		browser.storage.local.set({
			formInfo
		});
	}


	const extensionData = {
		init() {
			let data = {
				mpmSyncData: {
					version: LATEST_DATA_VERSION,
					urlStatuses: [],
				}
			};
			for (let site of supportedSites) {
				data.mpmSyncData.urlStatuses.push({
					url: site,
					status: "no action"
				});
			}
			this.set(data);
		},
		migrate(res) {
			if (res.mpmSyncData.version == LATEST_DATA_VERSION) {
				return;
			}

			let userSitesObject = res;
			let userSitesList = [];
			for (let site of userSitesObject.mpmSyncData.urlStatuses) {
				userSitesList.push(site.url);
			}

			// TODO: Add logic for when a site is REMOVED from the supportedSites array
			for (let site of supportedSites) {
				if ( !userSitesList.includes(site) ) {
					userSitesObject.mpmSyncData.urlStatuses.push({
						url: site,
						status: "no action"
					});
				}
			}
			userSitesObject.mpmSyncData.version = LATEST_DATA_VERSION;
			this.set(userSitesObject);
		},
		set(data) {
			browser.storage.sync.set(data);
		}
	};

	async function getUserInfo() {
		let formInfo = await browser.storage.local.get("formInfo");
		let userInfo = formInfo.formInfo;
		return userInfo;
	}

	let syncCheck = false;

	function logStorageChange(changes, area) {
		if (area === "sync" && !syncCheck) {
			syncCheck = true;
			syncUserInfo();
		}
	}

	async function syncUserInfo() {
		const storageInfo = browser.storage.sync.get();
		storageInfo.then((res) => {
			if ( Object.entries(res).length===0 || res.mpmSyncData === null ) {
				// console.log("syncUserInfo-init");
				extensionData.init();
			} else {
				extensionData.migrate(res);
			}
		});
	}

	// let activeTabHostname = null;
	let activeTabURL = null;

	function getActiveTabInfo(tab){
		// console.log(typeof tab.url);
		// console.log("setActiveTab", tab);
		activeTabURL = new URL(tab.url);
		console.log(activeTabURL);
		// console.log(activeTabURL.hostname);
		// activeTabHostname = activeTabURL.hostname;
	};

	function sendMessageToTabs(tabs) {
		for (let tab of tabs) {
			browser.tabs.sendMessage(
				tab.id,
				{greeting: "Hi from background script"}
			).then(response => {
				console.log("Message from the content script:");
				console.log(response.response);
			}).catch(
				
			);
		}
	}

	function panelOpenWithAction(request){
		console.log("panelOpenWithAction", request);
		browser.tabs.create({
			url: supportedSites[0],
			active: true
		});

		browser.tabs.query({
	    currentWindow: true,
	    active: true
  	}).then(sendMessageToTabs);



		// chrome.tabs.query({}, tabs => {
		//     tabs.forEach(tab => {
		//     chrome.tabs.sendMessage(tab.id, msgObj);
		//   });
		// });

		setTimeout(()=>{
			console.log("timeout");
			sendMessage({
				message: "panel-action-open"
			});
		}, 50);
		// let gettingCurrent = browser.tabs.getCurrent();
		// gettingCurrent.then((res) => {
		// 	console.log(res);
		// });
		// let currentTab = browser.tabs.getCurrent();
		// console.log(currentTab);
		//
		// });
	}

	function closeCurrentTab(sender) {
		browser.tabs.remove(sender.tab.id);
	}

	async function messageCatcher(request, sender, sendResponse) {
		console.log("messageCatcher", {request, sender, sendResponse});
		switch (request.message) {
			case "close-current-tab":
				closeCurrentTab(sender);
				return Promise.resolve({
					message: "closing-current-tab",
					response: "received"
				});
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
				return Promise.resolve({
					message: "send-ccpa-info",
					response: tempInfo
				});
			case "panel-site-action":
				console.log("panel-site-action");
				panelOpenWithAction(request);
				console.log(activeTabURL);
				return Promise.resolve({
					message: "panel-site-action-received",
					url: activeTabURL
				});
		}
	}

	function sendMessage(data) {
	  if (!data) { throw new Error("No message to send") }
	  let sending = browser.runtime.sendMessage(data);
	  sending.then(value => {
	    console.log(value);
	    // parseMessage(value);
	  }, reason => {
	    // rejection
	    console.error(reason);
	  });
	}


	browser.runtime.onMessage.addListener(messageCatcher);

	// Fires syncUserInfo ONCE per browser start up
	browser.storage.onChanged.addListener(logStorageChange);

	browser.browserAction.onClicked.addListener((tab) => {
	  // requires the "tabs" or "activeTab" permission
		console.log("browser.browserAction.onClicked");
		getActiveTabInfo(tab)
		let panelURL = browser.runtime.getURL("/panel.html");
		browser.browserAction.setPopup({popup: panelURL});
		browser.browserAction.openPopup();

	});

}
