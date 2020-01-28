"use strict";

console.log("options.js");

{
  const infoForm = document.querySelector("#userInfo");
  const submitButton = document.querySelector("#saveInfo");
  const editInfoButton = document.querySelector("#editButton");
  const infoDisplayWrapper = document.querySelector(".entered-info");
  const infoFormWrapper = document.querySelector(".info-form");

  function ccpaInfoCapture() {
    const info = {
      profileName: document.getElementById("userInfoProfile").value,
      firstName: document.getElementById("userInfoFirstName").value,
      lastName: document.getElementById("userInfoLastName").value,
      email: document.getElementById("userInfoEmail").value
    }
    return info;
  }

  infoForm.addEventListener("submit", function(e) {
    e.preventDefault();
    saveSubmissionInfo();
  });

  editInfoButton.addEventListener("click", function(e) {
    e.preventDefault();
    infoDisplayWrapper.style.display = "none";
    infoFormWrapper.style.display = "block";
    document.querySelector("#firstTimeForm").style.display = "none";
    // console.log(autoFillData);
    let formInputs = document.querySelectorAll("#userInfo input");
    for (let input of formInputs) {
      // console.log(input);
      let data = input.name;
      if ( autoFillData[data] ) {
        input.value = autoFillData[data]
      }
    }
  });

  function saveSubmissionInfo() {
    // console.log("saveSubmissionInfo");
    let formInfo = ccpaInfoCapture();
    sendMessage({
      message: "save-ccpa-info",
      formInfo
    });
  }

  let autoFillData = {};

  function populateSubmissionForm(resp) {
    // console.log(resp.response);
    if (resp.response === undefined) {
      // console.log("populateSubmissionForm-undefined");
      infoDisplayWrapper.style.display = "none";
      infoFormWrapper.style.display = "block";
    } else {
      // console.log("populateSubmissionForm-else");
      infoFormWrapper.style.display = "none";
      infoDisplayWrapper.style.display = "block";
      autoFillData = resp.response;
      let enteredInfoSpans = document.querySelectorAll(".entered-info-content span");
      for (let field of enteredInfoSpans) {
        let data = field.dataset.field;
        field.innerText = resp.response[data]
      }

    }
  }


  function getUserInfo() {
    // console.log("saveSubmissionInfo");
    sendMessage({
      message: "get-ccpa-info"
    });
  }

  function buildCards(data) {

    let actionData = data.actions;
    let actionStatuses = data.statuses;
    let statusLoop = ["no action", "pending", "completed"];

    let cardWrapper = document.querySelector("#actions");

    cardWrapper.innerHTML = "";

    let cardWrapperTitle = document.createElement("h1");
    cardWrapperTitle.innerText = "Recommendations";

    cardWrapper.insertAdjacentElement("beforeend", cardWrapperTitle);


    function createActionSectionHeader(action){

      if ( document.querySelector(".action-section") ) {
        let dataset = document.querySelector(".action-section").dataset.action;
        if ( dataset == action ) {
          return;
        }
      }

      let section = document.createElement("div");
      section.className = "action-section";
      section.dataset.action = action;
      cardWrapper.insertAdjacentElement("beforeend", section);

      let sectionTitle = document.createElement("h2");
      let capName = action.charAt(0).toUpperCase() + action.slice(1);
      sectionTitle.innerText = capName;

      section.insertAdjacentElement("beforeend", sectionTitle);

    }

    function getActionCardLinkItem(type, site, action){
      // console.log("getActionCardLinkItem");
      // console.log(actionData);
      let actionInfoArray = [];
      actionData.forEach( item => {
        // console.log(item);
        // console.log(item.site, site);
        if ( item.site == site ) {
          // console.log(item.site, site);
          Object.entries(item[type]).forEach( entry => {
            switch (type) {
              case "urls":
                if ( entry[0] === action ) {
                  let link = entry[1];
                  // console.log(link);
                  actionInfoArray.push(link);
                }
                break;
              case "actions":
                if ( entry[0] === action ) {
                  actionInfoArray.push(entry[1].title);
                }
                break;
              default:
                throw new Error("Data type unknown");
            }

          });
        }
      });
      if ( actionInfoArray === [] ) {
        return false;
      }
      return actionInfoArray;

    }

    for (let status of statusLoop) {
      // console.log(status);
      for (let site of Object.entries(actionStatuses)) {
        let siteName = site[0];
        let siteInfo = site[1];

        if ( Object.values(siteInfo).includes(status) ) {

          createActionSectionHeader(status);

          let actionSection = document.querySelector(
            ".action-section[data-action='" + status + "']"
          );

          let actionCard = document.createElement("div");
          actionCard.className = "action-card";

          let actionCardTitle = document.createElement("h3");
          let actionCardTitleLink = document.createElement("a");
          actionCardTitleLink.href = "https://" + siteName;
          actionCardTitleLink.innerText = siteName;
          // actionCardTitleLink.setAttribute("target", "_blank");
          actionCardTitle.insertAdjacentElement("beforeend", actionCardTitleLink);
          actionCard.insertAdjacentElement("beforeend", actionCardTitle);

          Object.entries(siteInfo).forEach( action => {
            // console.log(action);

            if ( action[1] !== status ) {
              return;
            }

            let actionCardLinkURL = getActionCardLinkItem("urls", siteName, action[0]);
            let actionCardLinkText = getActionCardLinkItem("actions", siteName, action[0]);
            let actionCardLink = document.createElement("a");
            actionCardLink.className = "action-button";
            actionCardLink.classList.add("button");
            if (actionCardLinkURL) {
              actionCardLink.dataset.url = actionCardLinkURL
            }
            // actionCardTitle title
            actionCardLink.innerText = actionCardLinkText;

            actionCard.insertAdjacentElement("beforeend", actionCardLink);

          });

          actionSection.insertAdjacentElement("beforeend", actionCard);

        }


      }
    }

    setPanelActionButtonListeners();
  }

  function refreshOptionsPage() {
    console.log("refreshOptionsPage");
    window.location.reload(true);
  }

  function parseMessage(value){
    // console.log("parseMessagevalue", value);
    switch (value.message) {
      case "send-ccpa-info":
        populateSubmissionForm(value);
        break;
      case "send-all-actions":
        buildCards(value);
        break;
      case "extension-data-reset":
        refreshOptionsPage();
        break;
    }
  }

  function setPanelActionButtonListeners() {
    let buttons = document.querySelectorAll(".action-button");
    for (let button of buttons) {
      button.addEventListener('click', () => {
        browser.tabs.create({
          url: button.dataset.url,
          active: true
        });
      });
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

  function optionsInit(){
    getUserInfo();
    sendMessage({message: "get-all-actions"})
    let resetButton = document.querySelector(".js-reset");
    resetButton.addEventListener('click', () => {
      sendMessage({
        message: "reset-extension-data"
      });
    });


    let autofillButton = document.querySelector(".fill-form");
    let autofillInfo = {
      profileName: document.getElementById("userInfoProfile"),
      firstName: document.getElementById("userInfoFirstName"),
      lastName: document.getElementById("userInfoLastName"),
      email: document.getElementById("userInfoEmail")
    }

    autofillButton.addEventListener('click', () => {
      autofillInfo.profileName.value = "Work";
      autofillInfo.firstName.value = "Fox";
      autofillInfo.lastName.value = "McCloud";
      autofillInfo.email.value = "fox@starfox.com";
    });



  }

  document.addEventListener('DOMContentLoaded', () => {
    optionsInit();
  });

}
