"use strict";

console.log("options.js");

{
  const infoForm = document.querySelector("#userInfo");
  const submitButton = document.querySelector("#saveInfo");

  function ccpaInfoCapture() {
    const info = {
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

  // function parseMessage(value){
  // 	switch (value.message) {
  // 		case "get-supported-sites":
  // 			setSupportedSitesArray(value);
  // 	}
  // }

  function saveSubmissionInfo() {
    console.log("saveSubmissionInfo");
    let formInfo = ccpaInfoCapture();
    sendOptionsMessage("save-ccpa-info", formInfo);
  }

  function sendOptionsMessage(message, formInfo) {
    console.log("sendOptionsMessage");
    console.log(formInfo);
    if (!message) { throw new Error("No message to send") }
    // if (!formInfo) { throw new Error("No info to send") }
    let sending = browser.runtime.sendMessage({message: message, formInfo: formInfo});
    sending.then(value => {
      console.log(value);
      // parseMessage(value);
     }, reason => {
      // rejection
      console.error(reason);
    });
  }


  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded");
    //
  });

}
