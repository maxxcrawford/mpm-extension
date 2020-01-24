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
    console.log(autoFillData);
    let formInputs = document.querySelectorAll("#userInfo input");
    for (let input of formInputs) {
      console.log(input);
      let data = input.name;
      if ( autoFillData[data] ) {
        input.value = autoFillData[data]
      }
    }
  });

  function saveSubmissionInfo() {
    console.log("saveSubmissionInfo");
    let formInfo = ccpaInfoCapture();
    sendMessage({
      message: "save-ccpa-info",
      formInfo
    });
  }

  let autoFillData = {};

  function populateSubmissionForm(resp) {
    console.log(resp.response);
    if (resp.response === undefined) {
      console.log("populateSubmissionForm-undefined");
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
    console.log("saveSubmissionInfo");
    sendMessage({
      message: "get-ccpa-info"
    });
  }

  function parseMessage(value){
    console.log("parseMessagevalue", value);
    switch (value.message) {
      case "send-ccpa-info":
        populateSubmissionForm(value);
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
    console.log("DOMContentLoaded");
    getUserInfo();
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
