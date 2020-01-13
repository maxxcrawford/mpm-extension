"use strict";

document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector(".button");

  button.addEventListener("click", (e) => {
    e.preventDefault();
    browser.tabs.create({
      url: "/options.html"
    });
    window.close();
  });

});
