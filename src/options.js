"use strict";

console.log("options.js");

const infoForm = document.querySelector("#userInfo");
// const submitButton = document.querySelector("#saveInfo");

const saveFormInfo = function() {
  
  // let savedInfo = [];
  //
  // let fieldInfo = infoForm.querySelectorAll("input");
  //
  // for (let input of fieldInfo) {
  //   if (input.type === "submit") { break; }
  //
  //   savedInfo.push({
  //     value: input.value
  //   });
  // }
  //
  // console.log(savedInfo[0]);
  //
  // browser.runtime.sendMessage({
  //   command: "beastify",
  //   beastURL: url
  // });
  //
  // browser.runtime.sendMessage({
  //   firstName: savedInfo[0];
  //   firstName:
  // }
  // );
};

  document.addEventListener('DOMContentLoaded', () => {

    infoForm.addEventListener('submit', saveFormInfo);

    // submitButton.addEventListener("click", (e) => {
    //   console.log("click");
    //   e.preventDefault();
    //
    // });


  });
