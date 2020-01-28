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

    console.log("buildCards", data);

    let actionData = data.actions;
    let actionStatuses = data.statuses;
    let statusLoop = ["no action", "pending", "completed"];

    let cardWrapper = document.querySelector("#actions");

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

    for (let status of statusLoop) {
      // console.log(status);
      for (let site of Object.entries(actionStatuses)) {
        let siteName = site[0];
        let siteInfo = site[1];
        // console.log(siteInfo);
        // console.log( Object.values(siteInfo) );

        if ( Object.values(siteInfo).includes(status) ) {
          createActionSectionHeader(status);

          let actionSection = document.querySelector(
            ".action-section[data-action='" + status + "']"
          );

          let actionCard = document.createElement("div");
          actionCard.className = "action-card";

          let actionCardTitle = document.createElement("h3");
          actionCardTitle.innerText = siteName;
          actionCard.insertAdjacentElement("beforeend", actionCardTitle);


          Object.keys(siteInfo).forEach( action => {

            let actionCardLink = document.createElement("a");
            actionCardLink.className = "action-button";
            actionCardLink.classList.add("button");
            actionCardLink.dataset.url = "";
            // actionCardTitle title
            actionCardLink.innerText = action;


            actionCard.insertAdjacentElement("beforeend", actionCardLink);

          });




          actionSection.insertAdjacentElement("beforeend", actionCard);


          // <div class="action-card">
          //   <h3>facebook</h3>
          //   <a class="action-button button" data-url="https://www.facebook.com/help/contact/784491318687824">request data</a>
          //   <a class="action-button button" data-url="https://www.facebook.com/help/contact/784491318687824">delete</a>
          //   <a class="action-button button" data-url="https://www.facebook.com/settings?tab=facerec">disable facial recognition</a>
          // </div>

          console.log(site);
        } else {
          console.log("none");
        }


      }
    }









    // <section class="action-section">
    //   <h2>No Action</h2>
    //   <div class="action-card">
    //     <h3>facebook</h3>
    //     <a class="action-button button" data-url="https://www.facebook.com/help/contact/784491318687824">request data</a>
    //     <a class="action-button button" data-url="https://www.facebook.com/help/contact/784491318687824">delete</a>
    //     <a class="action-button button" data-url="https://www.facebook.com/settings?tab=facerec">disable facial recognition</a>
    //   </div>
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
    // console.log("DOMContentLoaded");
    getUserInfo();
    sendMessage({message: "get-all-actions"})
    let buttons = document.querySelectorAll(".action-button");
    for (let button of buttons) {
      button.addEventListener('click', () => {
        browser.tabs.create({
          url: button.dataset.url,
          active: true
        });
      });
    }

  });

}
