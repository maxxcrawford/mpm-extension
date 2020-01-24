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

function parseMessage(value){
  console.log(value);
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
    // window.close();
  }


  let buttons = document.querySelectorAll(".button");
  for (let button of buttons) {
    button.addEventListener('click', () => {
      // console.log( button.dataset.action );
      sendMessage({
        message: "panel-site-action",
        action: button.dataset.action
      })
    });
  }
});

}
