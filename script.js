function addGotomarkButton() {
  const header = document.querySelector(
    "div[class^='headerProfile_bannerWrapper_']"
  );
 
  let gotomark_html =
    `<button class='extension' 
      id="go-to-mark">${messages['button-text']['gotomark']}</button>`;

  gotomark_html +=
    `<br><button class='extension' 
     style="position:fixed" id="stop">${messages['button-text']['stop']}</button>`;

  header.innerHTML += gotomark_html;

  let stop_button = document.querySelector("button#stop");
}

function addMarkCafecitoButton(cafecitos){
  for (const cafecito of cafecitos) {
    cafecito.innerHTML += `<button class="mark" style="padding: 2px 8px; width: auto; font-size: 15px">${messages['button-text']['mark']}</button>`
  }
}

function getMatchedCafecito(cafecitos) {
  for (const cafecito of cafecitos) {
    if(checkIfMatch(cafecito)){
      matched_cafecito = cafecito;
      return matched_cafecito;
    }
  }
}

function checkIfMatch(cafecito){
  description = cafecito.querySelector('div span[class^="coffee_text_"]').textContent;

  if(search_term === ''){
    return description == localStorage.getItem('identifier')
  } else{
    if(description.toLowerCase().includes(search_term.toLowerCase())){
      search_term = '';
      return true;
    }
    else{
      return false;
    }
  }
}

function markedCafecitoExist(){
  return localStorage.getItem('identifier') !== null;
}

function loadMoreCafecitos() {
  let loadmorecofee_button = document.querySelector(
    'button[class^="homeProfile_loadMoreCoffee_"]'
  );
  loadmorecofee_button.scrollIntoView({ block: "center" });
  loadmorecofee_button.click();
}

function watchNewCafecitos() {
  /*
    This function whatch for new cafecitos
    to add the mark button to them,
    and gotomatch if it was requested (flag variable)
  */

  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      for(const new_node of mutation.addedNodes){

        // if new node is not a cafecito exit
        if(new_node.tagName !== 'SECTION'){
          return; 
        }
        else{
          new_cafecito = new_node;
        }

        addMarkCafecitoButton([new_cafecito]);

        if(gotomatch == true){
          matched_cafecito = getMatchedCafecito([new_cafecito]);

          if (typeof matched_cafecito !== "undefined") {
            // si encontro el cafecito
            matched_cafecito.scrollIntoView({ block: "center" });
            gotomatch = false;
          } 
          else {
            // sino encontro cargar mas
            loadMoreCafecitos(); // this trigger again the observer
          }

        }
      }
    }
  };

  const config = { childList: true, subtree: true };
  const observer = new MutationObserver(callback);
  observer.observe(cafecitos_container, config);

  let stop_button = document.querySelector("button#stop");
  stop_button.addEventListener("click", () => {
    observer.disconnect();
  });
}

function goToMatch(){
  let cafecitos = document.querySelectorAll("section[class^='coffee_coffeeContainer_'");

  // search match cafecito in already loaded coffees
  matched_cafecito = getMatchedCafecito(cafecitos);

  if (typeof matched_cafecito !== "undefined") { // if it was found, scroll to it
    matched_cafecito.scrollIntoView({ block: "center" });
  }
  else { // if not, load more coffees
    loadMoreCafecitos(); // this trigger the observer, watchNewCafecitos()

    // and set the flag variable
    gotomatch = true;
  }
}

function markCafecito(target){
   // save description
   description = target.closest('section').querySelector(
     'div span[class^="coffee_text_"]'
   ).textContent;

   // save description as 'identifier' in LS
   localStorage.setItem('identifier', description);
   console.log(localStorage.getItem('identifier'))
}

function configureLanguage(lang){
  const messages = { 
    'es' : {
      'warning-not-mark': 'no marcaste ningun cafecito',
      'button-text' : {
        'gotomark': 'go to mark',
        'stop': 'parar',
        'mark': 'marcar'
      }
    },
    'en': {
      'warning-not-mark': 'there is not marked coffee',
      'button-text' : {
        'gotomark': 'go to mark',
        'stop': 'stop',
        'mark': 'mark'
      }
    }
  }

  return messages[lang] || messages['en'];
}

/* 
  litte glossary

  matched cafecito
    can be the marked coffe or 
    the coffe that includes the string sended in the popup menu
    whetever the user press go to mark or used the popup search menu
  cafecito
    means coffee in spanish
    I keep this name because is the original name
*/

// Initial setup

// setting some variables
let gotomatch;
const cafecitos = document.querySelectorAll("section[class^='coffee_coffeeContainer_'");
const cafecitos_container = document.querySelector("div[class^=homeProfile_rightContainer__] > div");

// exit if site is unsupported
if(cafecitos_container == null){ throw 'not supported site' + document.URL; }

// configuring language
const lang = 'es'
const messages = configureLanguage(lang);

// Main
addGotomarkButton()
addMarkCafecitoButton(cafecitos);
watchNewCafecitos();

// if a mark button is clicked markCafecito
cafecitos_container.addEventListener('click', (event) => {
  let target = event.target;

  if(target.tagName === 'BUTTON' && target.className === 'mark'){
    markCafecito(target)
  }
});

// if 'go to mark' is clicked, and marked cafecito exist, go to mark
const gotomark_button = document.querySelector("button#go-to-mark");
gotomark_button.addEventListener("click", () => {
  if(markedCafecitoExist()){
    goToMatch();
  }
  else {
    alert(message['warning-not-mark']);
  }
});

// listen popup search menu, if something is submit, call goToMatch
var search_term = '';
chrome.runtime.onMessage.addListener(({ input }) => {
  search_term = input;
  goToMatch();
});
