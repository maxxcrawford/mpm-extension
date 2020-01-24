"use strict";
{

	console.log("background");

	// List of supported sites
	const supportedSites = [
		"https://www.dunkindonuts.com/en/consumer-rights",
		"https://www.facebook.com/settings?tab=facerec",
		"https://www.facebook.com/help/contact/784491318687824"
	];

	// Generic descriptions for CCPA
	const ccpaDoNotSell = {
		title: "Do Not Sell",
		icon: "/images/donotsell-16.svg",
		description: "As a California resident you have the right to ask this website to not sell your personal information and activity.",
		cta: "Opt Out",
		action: "doNotSell"
	};

	const ccpaDataRequest = {
		title: "Download Personal Data",
		icon: "/images/download-16.svg",
		description: "You can request all the data this website has about out. Click Request Data to receive a copy.",
		cta: "Request Data",
		action: "dataRequest"
	};

	const ccpaDeleteRequest = {
		title: "Delete Personal Data",
		icon: "/images/delete-16.svg",
		description: "Delete the personal this site keep about you.",
		cta: "Opt Out",
		action: "deleteRequest",
		warning: true
	};

	const supportedSitesWithActions = {
		sites: [
			{
				site: "www.dunkindonuts.com",
				urls: {
					doNotSell: "https://www.dunkindonuts.com/en/consumer-rights",
					dataRequest: "https://www.dunkindonuts.com/en/consumer-rights",
					deleteRequest: "https://www.dunkindonuts.com/en/consumer-rights"
				},
				actions: [
					ccpaDoNotSell,
					ccpaDataRequest,
					ccpaDeleteRequest
				]
			},
			{
				site: "www.facebook.com",
				urls: {
					dataRequest: "https://www.facebook.com/help/contact/784491318687824",
					deleteRequest: "https://www.facebook.com/help/contact/784491318687824",
					facialRecognition: "https://www.facebook.com/settings?tab=facerec"
				},
				actions: [
					ccpaDataRequest,
					ccpaDeleteRequest,
					{
						title: "Disable Facial Recognition",
						icon: "/images/delete-16.svg",
						description: "Stop Facebook from using facial recognition technology to identify you in photos and videos.",
						cta: "Disable",
						action: "facialRecognition"
					}
				]
			}
		]
	};

	function getActionCards(url){
		for (let site of supportedSitesWithActions.sites) {
			if ( site.site ===  url ) {
				return site;
			}
		}
	}

	function countActionCards(url){
		for (let site of supportedSitesWithActions.sites) {
			if ( site.site ===  url ) {
				return site.actions.length;
			}
		}
	}

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
		// console.log("async function getUserInfo");
		let formInfo = await browser.storage.local.get("formInfo");
		let userInfo = formInfo.formInfo;
		return userInfo;
	}

	let syncCheck = false;
	let tempInfo = null;

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

	async function checkForRecommendations(){
		let currentTab = await browser.tabs.query({active: true, currentWindow: true});
		let currentTabURL = new URL(currentTab[0].url);
		// console.log(currentTabURL);

		let matchSwitch = false;

		for (let site of supportedSites) {
			// console.log(site);
			let siteURL = new URL(site);
			// console.log(siteURL.hostname);
			if (currentTabURL.hostname === siteURL.hostname) {
				matchSwitch = true;
			}
		}

		return {
			recommendations: matchSwitch,
			url: currentTabURL
		}

	}

	async function panelOpenWithAction(request){
		console.log("panelOpenWithAction", request);
		let userInfo = await getUserInfo();

		if (!userInfo) {
			browser.tabs.create({
				url: "/options.html#form",
				active: true
			});

			// TODO: Set listener to complete flow after entering info
			return;
		}

		browser.tabs.create({
			url: request.url,
			active: true
		});
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
			case "check-for-site-recommendations":
				let siteRecommendations = await checkForRecommendations();
				return Promise.resolve({
					message: "sites-recommendation-results",
					response: siteRecommendations
				});
			case "save-ccpa-info":
				saveUserInfo(request.formInfo);
				tempInfo = await getUserInfo();
				return Promise.resolve({
					message: "send-ccpa-info",
					response: tempInfo
				});
			case "get-ccpa-info":
				console.log("get-ccpa-info");
				tempInfo = await getUserInfo();
				return Promise.resolve({
					message: "send-ccpa-info",
					response: tempInfo
				});
			case "panel-site-action":
				console.log("panel-site-action");
				await panelOpenWithAction(request);
				console.log(activeTabURL);
				return Promise.resolve({
					message: "panel-site-action-received",
					url: activeTabURL
				});
			case "request-action-cards":
				let actionCards = getActionCards(request.site);
				return Promise.resolve({
					message: "send-action-cards",
					actions: actionCards
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

	async function updatePopupBubble() {
		let currentTab = await browser.tabs.query({active: true, currentWindow: true});
		console.log(currentTab[0]);
		let currentTabURL = new URL(currentTab[0].url);
		let siteRecommendations = await checkForRecommendations();
		if ( siteRecommendations.recommendations ) {
			console.log("count'em", currentTabURL);
			let actionCount = countActionCards(currentTabURL.hostname);
			actionCount = actionCount.toString();

			browser.browserAction.setBadgeText({
				text: actionCount,
				tabId: currentTab[0].id
			});
		}
	};

	browser.runtime.onMessage.addListener(messageCatcher);

	// Fires syncUserInfo ONCE per browser start up
	browser.storage.onChanged.addListener(logStorageChange);

	browser.browserAction.onClicked.addListener((tab) => {
	  // requires the "tabs" or "activeTab" permission
		console.log("browser.browserAction.onClicked");
		let panelURL = browser.runtime.getURL("/panel.html");
		browser.browserAction.setPopup({popup: panelURL});
		browser.browserAction.openPopup();
	});

	browser.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
		// console.log({tabId, changeInfo, tab});
  	if (changeInfo.status == 'complete' && tab.active) {
			console.log("onUpdated", {tabId, changeInfo, tab});
			updatePopupBubble();
		}
	});

	browser.tabs.onActivated.addListener( function (activeInfo) {
		console.log("onActivated", activeInfo);
		updatePopupBubble();
	});

	document.addEventListener('DOMContentLoaded', () => {
		console.log("DOMContentLoaded");
		updatePopupBubble();
	});

	browser.browserAction.setBadgeBackgroundColor({
		color: "#AD3BFF"
	});

	browser.browserAction.setBadgeTextColor({
		color: "#F2F2F3"
	});

}
