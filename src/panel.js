"use strict";

{

console.log("panel");

function parseMessage(value){
  console.log(value);
  switch (value.message) {
    case "panel-site-action-received":
      console.log("open-site");
      break;
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

document.addEventListener('DOMContentLoaded', () => {

  let buttons = document.querySelectorAll(".button");
  for (let button of buttons) {
    button.addEventListener('click', () => {
      console.log( button.dataset.action );
      sendMessage({
        message: "panel-site-action",
        action: button.dataset.action
      })
    });
  }
});

}
