'use strict';

import { generateUserKeys, exportKey, importKey } from '../../utils/crypto.ts';

const defaultOptions = require('../../options.json');

internationalize();
displayOptions();
enableFormInteractivity();

// Internationalize the UI
function internationalize () {
  document.querySelectorAll('[data-i18n]').forEach((node : any) => {
    const messageID = node.getAttribute('data-i18n');
    const internationalizedText = chrome.i18n.getMessage(messageID);
    node.innerText = internationalizedText;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node : HTMLInputElement) => {
    const messageID = node.getAttribute('data-i18n-placeholder');
    const internationalizedText = chrome.i18n.getMessage(messageID);
    node.placeholder = internationalizedText;
  });
}

/*
 * For an object like
 * "top": {
 *   "middle": {
 *     "final": "thing"
 *   }
 * }
 * and a key like "middle.final" returns "thing".
 * Does not support escaping
 */
function getWithNestedKey (object : any, key : any) {
  const keys = key.split('.');
  let curr = object;
  for (const name of keys) {
    if (typeof curr !== 'object' || curr === null || curr === undefined) {
      return;
    }
    curr = curr[name];
  }
  return curr;
}

function setWithNestedKey (object: any, key: string, value: any) {
  const keys = key.split('.');
  let curr = object;
  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    if (curr[key] === undefined || typeof curr[key] !== 'object') {
      curr[key] = {};
    }
    curr = curr[key];
  }
  const lastKey = keys[keys.length - 1];
  curr[lastKey] = value;
}

// Display all the current options
function displayOptions () {
  const queryNames = ['options', 'userID', 'userName'];
  chrome.storage.sync.get(queryNames, storage => {
    storage.options = storage.options || {};
    document.querySelectorAll('INPUT').forEach((node : HTMLInputElement) => {
      // Retreive applicable options
      const key = node.getAttribute('dataKey');
      let value = getWithNestedKey(storage.options, key);
      // Use default only if user option is not defined
      if (value === undefined) {
        value = getWithNestedKey(defaultOptions, key);
      }

      switch (node.type) {
        case 'checkbox':
          node.checked = value;
          break;
        case 'color':
          node.value = value;
          break;
        case 'text':
          /* fallthrough */
        case 'number':
          node.value = value || '';
          break;
      }
    });
    const userID : string = storage.userID || '';
    document.getElementById('userID').innerText = userID;

    const userName : any = storage.userName || '';
    const userNameNode : HTMLInputElement = <HTMLInputElement>document.getElementById('userName');
    userNameNode.value = userName;
  });
}

/*
 * Returns the value of the INPUT node
 */
function getValue (input : any) {
  switch (input.type) {
    case 'checkbox':
      return input.checked;
    case 'text':
    case 'color':
      return input.value;
    case 'number':
      return Number(input.value);
  }
}

function enableFormInteractivity () {
  // Show userName "Save" button
  document.getElementById('userName').oninput = (a) => {
    document.getElementById('userNameButton').hidden = false;
  };

  document.getElementById('userNameForm').onsubmit = (a) => {
    const input : HTMLInputElement = <HTMLInputElement>document.getElementById('userName');
    const newUserName = input.value;
    // TODO: do nothing if name did not actually change

    const message = {
      type: 'postOptions',
      options: {
        userName: newUserName
      }
    };

    chrome.runtime.sendMessage(message, () => {});
    document.getElementById('userNameButton').hidden = true;

    return false;
  };

  document.getElementById('optionsForm').onsubmit = (a) => {
    const newOptions = {};

    // Read in the options
    document.querySelectorAll('INPUT').forEach(node => {
      const key = node.getAttribute('dataKey');
      const value = getValue(node);
      setWithNestedKey(newOptions, key, value);
    });

    // Save the new options
    chrome.storage.sync.set({ options: newOptions }, () => {
      window.close();
      // TODO: check options
    });

    // Prevent page reload
    return false;
  };

  // Reset user keys
  document.getElementById('userKeys_reset').onclick = (a) => {
    generateUserKeys().then((userID : any) => {
      document.getElementById('userID').innerText = userID;
    });
  };

  // Import user keys from external backup
  // TODO: validate imported data, generate userID and public key from
  // private data only.
  document.getElementById('userKeys_import').onclick = () => {
    function upload (callback : any) {
      const input : HTMLInputElement = <HTMLInputElement>document.createElement('INPUT');
      input.type = 'file';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.oninput = () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const target : any = event.target;
          const data = target.result;
          callback(data);
        };
        reader.readAsText(file);
      };
      input.click();
      setTimeout(() => {
        document.body.removeChild(input);
      }, 0);
    }

    function importKey_ (data : any) {
      // TODO: security
      const key = JSON.parse(data);
      importKey(key)
        .then((userID : any) => {
          document.getElementById('userID').innerText = userID;
        })
        .catch(error => {
          console.log('Failed to import key', error);
        });
    }
    upload(importKey_);
  };

  // Export user keys to external backup (download as a file)
  // TODO: 1. Actually download a file (not just write to clipboard)
  //       2. Display download button only if there is a key to be exported
  document.getElementById('userKeys_export').onclick = (a) => {
    function keyExportFailed (error: Error) {
      console.error('Could not export key', error);
    }
    exportKey((key: any) => {
      const text = JSON.stringify(key);
      navigator.clipboard.writeText(text)
        .then(() => console.info('Key copied'))
        .catch(keyExportFailed);
    });
  };
}
