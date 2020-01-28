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

function getPendingItems(data){
  let pendingItems = Object.entries(data);
  console.log("pendingItems", pendingItems);

  let confirmationsList = document.querySelector("#confirmationsList");

  function decodeSiteAction(action){
    console.log(action);
    let string;
    switch (action) {
      case "doNotSell":
        string = "do not sell"
        break;
      case "facialRecognition":
        string = "disable facial recognition"
        break;
      default:
        return false;
    }

    return string;
  }

  pendingItems.forEach( (item, i) => {
    let idName = "site" + i;
    let siteName = item[0];
    siteName = siteName.replace("www.", "");
    // siteName = siteName.toUpperCase()
    let siteAction = item[1];
    siteAction = decodeSiteAction(siteAction);

    let pendingItemHTML = document.createElement("div")
    pendingItemHTML.className = "site";

    let pendingItemLabel = document.createElement("label");
    pendingItemLabel.className = "site-name";
    pendingItemLabel.htmlFor = idName;
    pendingItemHTML.insertAdjacentElement("beforeend", pendingItemLabel);

    let pendingItemSpan = document.createElement("span");
    pendingItemSpan.innerText = siteName;
    pendingItemLabel.insertAdjacentElement("beforeend", pendingItemSpan);

    if (siteAction) {
      let pendingItemSpan2 = document.createElement("span");
      pendingItemSpan2.innerText = siteAction;
      pendingItemSpan.insertAdjacentElement("beforeend", pendingItemSpan2);
    }

    let pendingItemInput = document.createElement("input");
    pendingItemInput.setAttribute("type", "checkbox");
    pendingItemInput.id = siteName;
    pendingItemHTML.insertAdjacentElement("beforeend", pendingItemInput);

    confirmationsList.insertAdjacentElement("beforeend", pendingItemHTML)

  });

  confirmationsListenerInit();

}

function buildCards(data) {
  console.log(data);
  let actionsData = Object.entries(data.actions.actions);
  let actionsURLs = data.actions.urls;
  let status = data.status;

  let actionsContainer = document.querySelector(".card-site-not-empty");

  console.log(status);


  actionsData.forEach( item => {
    let actionData = item[1];

    let card = document.createElement("div");
    card.className = "card";
    if (actionData.warning) { card.classList.add("warning") }

    let actionStatus = status[actionData.action];
    console.log(actionStatus);

    // Build Title
    let cardTitle = document.createElement("div");
    cardTitle.className = "card-title";
    let cardTitleIcon = document.createElement("img");
    cardTitleIcon.className = "svg";
    cardTitleIcon.src = actionData.icon;
    let cardTitleText = document.createElement("span");
    cardTitleText.innerText = actionData.title;
    cardTitle.insertAdjacentElement("beforeend", cardTitleIcon);
    cardTitle.insertAdjacentElement("beforeend", cardTitleText);
    card.insertAdjacentElement("beforeend", cardTitle);

    // Build Description
    let cardDescription = document.createElement("div");
    cardDescription.className = "card-description";
    cardDescription.innerText = actionData.description;
    card.insertAdjacentElement("beforeend", cardDescription);

    // Build Action
    let cardAction = document.createElement("div");
    cardAction.className = "card-action";

    if ( actionStatus === "pending" ) {
      cardAction.innerText = "Pending";
      card.classList.add("pending", "js-pending");
    } else {
      cardAction.classList.add("button", "js-card-action");
      cardAction.innerText = actionData.cta;
      cardAction.dataset.action = actionData.action
      cardAction.dataset.url = actionsURLs[actionData.action]
    }

    card.insertAdjacentElement("beforeend", cardAction);

    actionsContainer.insertAdjacentElement("beforeend", card);
  });

  let cardActions = document.querySelectorAll(".js-card-action");
  for (let action of cardActions) {
    action.addEventListener('click', () => {
      sendMessage({
        message: "panel-site-action",
        action: action.dataset.action,
        url: action.dataset.url
      })
    });
  }

  let pendingActionButtons = document.querySelectorAll(".js-pending");
  pendingActionButtons.forEach( button => {
    button.addEventListener("click", () => {
      changePanel("confirmations");
    });
  });

  let pendingAction = document.querySelectorAll(".js-pending");
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

  if (count > 0) {
    let buttonConfirmations = document.querySelector(".button-confirmations");
    buttonConfirmations.addEventListener('click', () => {
      // console.log(backButton);
      changePanel("confirmations");
    });
  }
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
      getActiveCards(value.actions);
      break;
    case "send-action-cards-assets":
      buildCards(value);
      break;
    case "send-pending-actions-count":
      updatePendingActionsCount(value.response);
      break;
    case "send-pending-confirmations":
      getPendingItems(value.response)
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
      sendMessage({message: "get-pending-confirmations"});
      break;
    default:
      console.error(`No panel found for #${panel}`);
  }

}


function confirmationsListenerInit(){

  let confirmationsForm = document.querySelector("#confirmationsList");
  let checkBoxes = confirmationsForm.querySelectorAll("input[type='checkbox']")
  // console.log("confirmationsListenerInit", confirmationsForm);

  let selectAllButton = document.querySelector(".confirmation-button");
  selectAllButton.addEventListener('click', () => {
    console.log("selectAllButton");
    checkBoxes.forEach( checkbox => checkbox.checked = !checkbox.checked);
  });

  let viewCompletedButton = document.querySelector(".view-completed-button");
  viewCompletedButton.addEventListener('click', () => {
    console.log("view-completed-button");
    // checkBoxes.forEach( checkbox => checkbox.checked = true);
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
