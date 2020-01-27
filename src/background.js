"use strict";
{

	console.log("background");

	// List of supported sites
	const staticSupportedSites = [
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

	function getNoActionsCards(data){
		let noActionCards = [];
		data.forEach( item => {
			if (item.status === "no action") {
				noActionCards.push(item.action);
			}
		});
		return noActionCards;
	}

	function getActionsCount(data, string){
		let statusList = data.map(action => action.status);
		let noActionOnly = statusList.filter(str => { return str.includes(string) });
		return noActionOnly.length;
	}

	async function countActionCards(url, string){
		// TODO: Update count to use mpmSyncData dataset instead
		let data = await browser.storage.local.get("mpmSyncData");
		for (let site of data.mpmSyncData.urlStatuses) {
			if ( site.site ===  url ) {
				return getActionsCount(site.actions, string);
			}
		}
	}

	// async function getActionCards(url){
	// 	console.log("gatherActionCards");
	// 	// TODO: Update count to use mpmSyncData dataset instead
	// 	console.log(url);
	// 	let data = await browser.storage.local.get("mpmSyncData");
	// 	let activeCardList;
	// 	for (let site of data.mpmSyncData.urlStatuses) {
	// 		if ( site.site ===  url ) {
	// 			// console.log( getNoActionsCards(site.actions) );
	// 			activeCardList = getNoActionsCards(site.actions);
	// 		}
	// 	}
	//
	// 	let actionsArray;
	//
	// 	for (let site of supportedSitesWithActions.sites) {
	// 		if ( site.site ===  url ) {
	// 			actionsArray = site.actions
	// 		}
	// 	}
	//
	// 	return noActionCards;
	//
	// 	console.log(actionsArray);
	//
	// }

	let userInfo = null;

	// If the shape of this data changes, bump this version number and creat a
	// migration function that references it
	const LATEST_DATA_VERSION = 0.1;

	function saveUserInfo(formInfo) {
		browser.storage.local.set({
			formInfo
		});
	}


	/**
	 * buildActionsArray - Loops through list of actions for an unsynced site and creates a new object with a status "no action"
	 *
	 * @param  {type} data array of site actions from the supportedSitesWithActions object.
	 * @return {type}      array
	 */
	function buildActionsArray(data) {
		let actionList = Object.keys(data);

		let array = [];

		for (let action of actionList) {
			array.push({
				action,
				status: "no action"
			})
		};

		return array;
	}

	const extensionData = {
		init() {
			let data = {
				mpmSyncData: {
					version: LATEST_DATA_VERSION,
					urlStatuses: [],
				}
			};
			for (let site of supportedSitesWithActions.sites) {
				let actionArr = buildActionsArray(site.urls);
				data.mpmSyncData.urlStatuses.push({
					site: site.site,
					actions: actionArr
				});
			}
			this.set(data);
		},
		async get() {
			let data = await browser.storage.local.get("mpmSyncData");
			return data;
		},
		migrate(res) {
			if (res.mpmSyncData.version == LATEST_DATA_VERSION) {
				return;
			}

			let userSitesObject = res;
			let userSitesList = [];
			for (let site of userSitesObject.mpmSyncData.urlStatuses) {
				userSitesList.push(site.site);
			}

			// TODO: Add logic for when a site is REMOVED from the supportedSites array
			for (let site of supportedSitesWithActions.sites) {
				if ( !userSitesList.includes(site.site) ) {
					let actionsArray = buildActionsArray(site.urls);
					userSitesObject.mpmSyncData.urlStatuses.push({
						site: site.site,
						actions: actionsArray
					});
				}
			}
			userSitesObject.mpmSyncData.version = LATEST_DATA_VERSION;
			this.set(userSitesObject);
		},
		set(data) {
			console.log("data", data);
			browser.storage.local.set(data);
			// browser.storage.sync.set(data);
		},
		async update(data) {
			let syncData = await this.get();
			let url = new URL(data.source);
			url = url.hostname;

			let site = syncData.mpmSyncData.urlStatuses.filter(
				item => {
					return item.site === url;
				}
			)

			let actions = site[0].actions.filter(
				item => {
					return item.action === data.action;
				}
			)
			actions[0]["status"] = data.status;

			this.set(syncData);
		},
	};

	async function getUserInfo() {
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
		const storageInfo = browser.storage.local.get();
		storageInfo.then((res) => {
			if ( Object.entries(res).length===0 || res.mpmSyncData === null ) {
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

		let matchSwitch = false;

		for (let site of staticSupportedSites) {
			let siteURL = new URL(site);
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

	function updateActionStatus(data) {
		let source = data.sender.url;
		let action = data.action;
		let status = data.status;
		extensionData.update({action, source, status})
	}

	function closeCurrentTab(sender) {
		console.log("closeCurrentTab");
		browser.tabs.remove(sender.tab.id);
	}

	async function messageCatcher(request, sender, sendResponse) {
		console.log("messageCatcher", {request, sender, sendResponse});
		switch (request.message) {
			case "close-current-tab":
				console.log("close-current-tab", request);
				updateActionStatus({
					sender,
					action: request.action,
					status: request.status
				});
				closeCurrentTab(sender);
				return Promise.resolve({
					message: "closing-current-tab",
					response: "received"
				});
			case "get-supported-sites":
				return Promise.resolve({
					message: "send-supported-sites",
					response: staticSupportedSites
				});
			case "get-pending-actions-count":
				let actionCount = 1;
				// let actionCount = await countActionCards(currentTabURL.hostname, "no action");
				return Promise.resolve({
					message: "send-pending-actions-count",
					response: actionCount
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
				tempInfo = await getUserInfo();
				return Promise.resolve({
					message: "send-ccpa-info",
					response: tempInfo
				});
			case "panel-site-action":
				await panelOpenWithAction(request);
				return Promise.resolve({
					message: "panel-site-action-received",
					url: activeTabURL
				});
			case "request-action-cards":
				console.log(request.site);
				let actionCards = await getActionCards(request.site);
				// let actionCards = getActionCards(request.site);
				return Promise.resolve({
					message: "send-action-cards-assets",
					actions: actionCards
				});
		}
	}

	// function sendMessage(data) {
	//   if (!data) { throw new Error("No message to send") }
	//   let sending = browser.runtime.sendMessage(data);
	//   sending.then(value => {
	//     console.log(value);
	//     // parseMessage(value);
	//   }, reason => {
	//     // rejection
	//     console.error(reason);
	//   });
	// }

	async function updatePopupBubble() {
		let currentTab = await browser.tabs.query({active: true, currentWindow: true});
		let currentTabURL = new URL(currentTab[0].url);
		let siteRecommendations = await checkForRecommendations();
		if ( siteRecommendations.recommendations ) {
			let actionCount = await countActionCards(currentTabURL.hostname, "no action");
			actionCount = actionCount.toString();
			browser.browserAction.setBadgeText({
				text: actionCount,
				tabId: currentTab[0].id
			});
		}
	};

	async function getCurrentThemeInfo() {
		let themeInfo = await browser.theme.getCurrent();
		themeInfo.then( res => {
				console.log(res);
			}
		);
		// getStyle(themeInfo);
		// console.log(themeInfo);
	}

	browser.runtime.onMessage.addListener(messageCatcher);

	// Fires syncUserInfo ONCE per browser start up
	browser.storage.onChanged.addListener(logStorageChange);

	browser.browserAction.onClicked.addListener((tab) => {
	  // requires the "tabs" or "activeTab" permission
		let panelURL = browser.runtime.getURL("/panel.html");
		browser.browserAction.setPopup({popup: panelURL});
		browser.browserAction.openPopup();
	});

	browser.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  	if (changeInfo.status == 'complete' && tab.active) {
			updatePopupBubble();
		}
	});

	browser.tabs.onActivated.addListener( function (activeInfo) {
		updatePopupBubble();
	});

	document.addEventListener('DOMContentLoaded', () => {
		updatePopupBubble();
		syncUserInfo();
		getCurrentThemeInfo();
	});

	browser.browserAction.setBadgeBackgroundColor({
		color: "#AD3BFF"
	});

	browser.browserAction.setBadgeTextColor({
		color: "#F2F2F3"
	});

	function handleInstalled(details) {
	  // browser.tabs.create({
	  //   url: "/options.html"
	  // });
	}

	browser.runtime.onInstalled.addListener(handleInstalled);



}
