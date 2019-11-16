'use strict';

if (chrome.runtime.openOptionsPage) {
  document.getElementById('options').onclick = () => {
    chrome.runtime.openOptionsPage();
  };
}
