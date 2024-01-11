document.addEventListener("DOMContentLoaded", function(){

  document.querySelector("button#search").addEventListener("click", function(){
    let input = document.querySelector('input').value;

    // Send a message to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { input });
    });

  });

});
