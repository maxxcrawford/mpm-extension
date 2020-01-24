"use strict";

{

console.log("panel", document);

// const cardsNoRecommendations = ;
// const cardsRecommendations = document.querySelector(".card-site-not-empty");

function toggleSiteRecommendations(resp){
  let url = new URL(resp.response.url);
  url = url.hostname
  // console.log( url.length );
  if (url.length < 1) { url = "this site." }
  // url.hostname = "this site"

  document.querySelectorAll("span[name='activeTab']").forEach((span) => {
    span.innerText = url;
  })
  // console.log("toggleSiteRecommendations", resp);
  if (resp.response.recommendations) {
    sendMessage({
      message: "request-action-cards",
      site: url
    });
    document.querySelector(".card-site-not-empty").style.display = "block";
  } else {
    document.querySelector(".card-site-empty").style.display = "block";
  }
}

function updateAutofill(resp) {
  // console.log("updateAutofill", resp);
  let profileNameSpan = document.querySelector("span[name='profileName']");
  if ( !resp.response ) {
    // Update to "Set Info"
    profileNameSpan.innerText = "Set Info"
  } else {
    // Set Profile Name
    profileNameSpan.innerText = resp.response.profileName;
  }
}

function buildCards(actions) {
  console.log(actions);
  let actionsData = actions.actions;
  let actionsURLs = actions.urls;

  let actionsContainer = document.querySelector(".card-site-not-empty");

  actionsData.forEach( item => {
    let card = document.createElement("div");
    card.className = "card";
    if (item.warning) { card.classList.add("warning") }

    // Build Title
    let cardTitle = document.createElement("div");
    cardTitle.className = "card-title";
    let cardTitleIcon = document.createElement("img");
    cardTitleIcon.className = "svg";
    cardTitleIcon.src = item.icon;
    let cardTitleText = document.createElement("span");
    cardTitleText.innerText = item.title;
    cardTitle.insertAdjacentElement("beforeend", cardTitleIcon);
    cardTitle.insertAdjacentElement("beforeend", cardTitleText);
    card.insertAdjacentElement("beforeend", cardTitle);

    // Build Description
    let cardDescription = document.createElement("div");
    cardDescription.className = "card-description";
    cardDescription.innerText = item.description;
    card.insertAdjacentElement("beforeend", cardDescription);

    // Build Action
    let cardAction = document.createElement("div");
    cardAction.className = "card-action";
    cardAction.classList.add("button");
    cardAction.innerText = item.cta;
    cardAction.dataset.action = item.action
    cardAction.dataset.url = actionsURLs[item.action]

    card.insertAdjacentElement("beforeend", cardAction);

    actionsContainer.insertAdjacentElement("beforeend", card);
  });

  let cardActions = document.querySelectorAll(".card-action");
  for (let action of cardActions) {
    action.addEventListener('click', () => {
      sendMessage({
        message: "panel-site-action",
        action: action.dataset.action,
        url: action.dataset.url
      })
    });
  }

}

function parseMessage(value){
  console.log(value);
  if (!value) { return }
  switch (value.message) {
    case "panel-site-action-received":
      console.log("open-site");
      break;
    case "sites-recommendation-results":
      toggleSiteRecommendations(value);
      break;
    case "send-ccpa-info":
      updateAutofill(value);
      break;
    case "send-action-cards":
      console.log("caught");
      buildCards(value.actions);
      break;
  }
}

function sendMessage(data) {
  if (!data) { throw new Error("No message to send") }
  let sending = browser.runtime.sendMessage(data);
  sending.then(value => {
    // console.log(value);
    parseMessage(value);
  }, reason => {
    // rejection
    console.error(reason);
  });
}

document.addEventListener('DOMContentLoaded', () => {

  sendMessage({message: "check-for-site-recommendations"});

  sendMessage({message: "get-ccpa-info"});

  let buttonsURLs = document.querySelectorAll(".button-url");
  for (let button of buttonsURLs) {
    button.addEventListener('click', () => {
      browser.tabs.create({
        url: button.dataset.url,
        active: true
      });
      window.close();
    });
  }
});

}
