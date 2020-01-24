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

function getActiveCards(data) {
  sendMessage({
    message: "get-active-cards"
  });
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

function updatePendingActionsCount(count) {
  document.querySelector("#pendingActionsCount").innerText = count;
}

function parseMessage(value){
  console.log(value);
  if (!value) { return }
  switch (value.message) {
    case "sites-recommendation-results":
      toggleSiteRecommendations(value);
      break;
    case "send-ccpa-info":
      updateAutofill(value);
      break;
    case "send-active-cards":
      console.log("caught");
      getActiveCards(value.actions);
      break;
    case "send-action-cards-assets":
      console.log("caught");
      buildCards(value.actions);
      break;
    case "send-pending-actions-count":
      updatePendingActionsCount(value.response)
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

function changePanel(panel) {
  let confirmationsBody = document.getElementById("confirmations", panel);
  let homeBody = document.getElementById("home");

  switch (panel) {
    case "home":
      homeBody.style.display = "block";
      confirmationsBody.style.display = "none";
      break;
    case "confirmations":
      homeBody.style.display = "none";
      confirmationsBody.style.display = "block";
      break;
    default:
      console.error(`No panel found for #${panel}`);
  }

}


function confirmationsListenerInit(){

  let buttonConfirmations = document.querySelector(".button-confirmations");
  buttonConfirmations.addEventListener('click', () => {
    // console.log(backButton);
    changePanel("confirmations");
  });

  let confirmationsForm = document.querySelector("#confirmationsList");
  let checkBoxes = confirmationsForm.querySelectorAll("input[type='checkbox']")
  // console.log("confirmationsListenerInit", confirmationsForm);

  let selectAllButton = document.querySelector(".confirmation-button");
  selectAllButton.addEventListener('click', () => {
    checkBoxes.forEach( checkbox => checkbox.checked = true);
  });

  let backButton = document.querySelector(".back-button");
  backButton.addEventListener('click', () => {
    // console.log(backButton);
    changePanel("home");
  });
}

document.addEventListener('DOMContentLoaded', () => {

  let homeBody = document.getElementById("home");
  homeBody.style.display = "block";

  sendMessage({message: "get-pending-actions-count"});
  sendMessage({message: "check-for-site-recommendations"});
  sendMessage({message: "get-ccpa-info"});

  confirmationsListenerInit();

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



  let buttonConfirmationsPanel = document.querySelector(".button-confirmations");
  buttonConfirmationsPanel.addEventListener('click', () => {
    console.log("buttonConfirmationsPanel");
  });

});

}
