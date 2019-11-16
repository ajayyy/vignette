/*
 * These are Promise wrappers around the
 * standard browser APIs
 */

export async function storageGet (keys: any) {
  return new Promise(resolve => {
    chrome.storage.sync.get(keys, data => {
      resolve(data);
    });
  });
}

export async function storageSet (data: any) {
  return new Promise(resolve => {
    chrome.storage.sync.set(data, () => resolve());
  });
}

export function runtimeOnMessageAddListener (/* async */ handler: any /* (message, sender) */) {
  function syncHandler (message: any, sender: any, sendResponse: any) {
    handler(message, sender)
      .then((response: any) => sendResponse(response));
  }
  chrome.runtime.onMessage.addListener(syncHandler);
}
