"use strict";

window.addEventListener("click", (e) => {
  e.preventDefault();
  browser.tabs.create({
    url: "/options.html"
  });
  window.close();
});
