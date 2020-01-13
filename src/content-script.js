"use strict";

// TODO: Add logic to only run specific recipie based on URL
console.log("content-script.js v2");

// TODO: Use form to populate information

let input = document.getElementById("category_1");
let input2 = document.getElementById("parent_1_option_1");
let email = document.getElementById("emailInput");

// setTimeout(()=>{
// 	input.click();
// }, 2000);
setTimeout(()=>{
	input2.click();
}, 500);
setTimeout(()=>{
	email.focus();
	email.select();
	email.value = "maxx.crawford+8@gmail.com";
	email.blur();
}, 1000);

const form = document.querySelector(".doNotSell__form");

console.log(form);

setTimeout(()=>{
	let submit = form.querySelector("input[type=submit]");
	console.log(submit);
	submit.click();
	// form.submit();
}, 2000);

// document.querySelector('.recaptcha-audio-button').contentWindow.document.getElementById("recaptcha-audio-button").click()

// form.submit();

// /*
// Listen for messages from the page.
// If the message was from the page script, show an alert.
// */
// window.addEventListener("message", (event) => {
//   if (event.source == window &&
//       event.data &&
//       event.data.direction == "from-page-script") {
//     alert("Content script received message: \"" + event.data.message + "\"");
//   }
// });
//
// /*
// Send a message to the page script.
// */
// function messagePageScript() {
//   window.postMessage({
//     direction: "from-content-script",
//     message: "Message from the content script"
//   }, "https://mdn.github.io");
// }
//
// /*
// Add messagePageScript() as a listener to click events on
// the "from-content-script" element.
// */
// var fromContentScript = document.getElementById("from-content-script");
// fromContentScript.addEventListener("click", messagePageScript);
