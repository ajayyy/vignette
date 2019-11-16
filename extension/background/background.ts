'use strict';

/*
 * Background is heavily based on Promisses,
 * pretty much all functions are async,
 * the W3C WebExtension style.
 */

/*
import * as defaultOptions from '../../options.js'
import * as customCrypto from '../utils/crypto.js'
import * as promisses from '../utils/promissified.js'
*/

// import * as defaultOptions_ from '../options.js'

import { generateUserKeys, signMessage } from '../utils/crypto.ts';

import { storageGet, runtimeOnMessageAddListener } from '../utils/promissified.ts';

const defaultOptions = require('../options.json');

/*
 * This function is NOT async because there is nothing
 * to return.
 */
chrome.runtime.onInstalled.addListener((details) => {
  // If this is the first install, generate new userID
  if (details.reason === 'install') {
    generateUserKeys()
      .then((userID: string) => {
        console.info('Initial install, userID = ' + userID);
      })
      .catch(error => {
        console.error('Failed to generate the keys', error);
      });
  }
});

// Process messages from elsewhere

/*
 * Reports error to the server, if feature is enabled.
 * NOTE: This can not rely on serverCall() because
 * when serverCall() fails it calls reportError
 * so there would be a cyclical dependency.
 */
async function reportError (data : any) {
  // Report error, if needed
  const options = (<any>(await storageGet(['options']))).options;
  const serverAddress = options && options.serverAddress
    ? options.serverAddress : defaultOptions.serverAddress;
  const reportErrors = options && options.reportErrors
    ? options.reportErrors : defaultOptions.reportErrors;

  // If error reporting is disabled, log error locally
  if (!reportErrors) {
    console.error('Remote error reporting is disabled. Error data: ' + JSON.stringify(data));
    return;
  }

  const url = serverAddress + '/v0/error/';
  fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      // TODO: check that error is submitted correctly
    })
    .catch((error) => {
      console.error('reportError: fetch failed', error, data);
    });
}

/*
 * Generates new userID, saves it and returns it.
 */
async function resetUserKeys () {
  const userID = await generateUserKeys();
  return userID;
}

/*
 * Sends a request to the server
 * @param method HTTP method
 * @param path path to be appended to the API server root
 * @param body (optional) request body, if applicable
 */
async function serverCall (method : any, path : any, body : any) {
  // TODO: validate inputs
  const options = (<any>(await storageGet(['options']))).options;
  const serverAddress = options && options.serverAddress
    ? options.serverAddress : defaultOptions.serverAddress;
  const url = serverAddress + path;
  const request : RequestInit = {
    method: method,
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: body
  };

  const response = await fetch(url, request);
  const object = await response.json();
  return object;
}

async function signedMessage (message : any) {
  const normalizedMessage = JSON.stringify(message);
  const signature = await signMessage(normalizedMessage);
  return JSON.stringify({
    message: normalizedMessage,
    signature: signature
  });
}

/*
 * Router for each kind of message
 */
runtimeOnMessageAddListener(async (message : any, sender : any) => {
  let method = null;
  let path = null;
  let body = null;

  switch (message.type) {
    // Internal APIs
    case 'resetUserKeys':
      return resetUserKeys();

    // Network API calls fulfilled via serverCall()
    case 'getServerInfo':
      method = 'GET';
      path = '/info';
      break;
    case 'getVideoSegments':
      method = 'GET';
      path = '/v0/segments/' + message.platform + '/' + message.videoID;
      break;
    case 'postFeedback':
      method = 'POST';
      path = '/v0/feedback';
      body = 'TODO';
      break;
    case 'postVideoSegments':
      method = 'POST';
      path = '/v0/segments';
      body = await signedMessage(message.segments);
      break;
    case 'postOptions':
      method = 'POST';
      path = '/v0/options';
      body = await signedMessage(message.options);
      console.error(body);
      chrome.storage.sync.set(message.options);
      break;

    // Can result in network API call, but not via serverCall()
    case 'error':
      reportError(message);
      return;
    case 'SIGN_CONNECT':
      // Ignore message sent by live extension reloader
      // (used only during development for live builds)
      return;
    default:
      reportError({
        text: 'Unknown message received by the background',
        sender: sender,
        message: message
      });
      return;
  }

  // Network API calls fulfilled via serverCall()
  try {
    const response = await serverCall(method, path, body);
    return response;
  } catch (error) {
    console.error(error);
    // Server call failed
  }
});
