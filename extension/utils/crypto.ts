import { storageGet } from './promissified.ts';

/*
 * Checks endiadness of the system
 * (to validate that TextEncoder works as expected.
 */
function systemIsLittleEndian (): boolean {
  return ((new Uint32Array((new Uint8Array([1, 2, 3, 4])).buffer))[0] === 0x04030201);
}

function ArrayBufferToString (arrayBuffer: any): string {
  const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
  const exportedAsBase64 = window.btoa(exportedAsString);
  return exportedAsBase64;
}

/*
 * Stringifies public key in a reproducible manner.
 * This is necessary to avoid ambiguety of key representation
 * by JSON.stringify()
 */
function stringifyPublicKey (key : any): string {
  return '{' +
    '"kty":"' + key.kty + '",' +
    '"crv":"' + key.crv + '",' +
    '"x":"' + key.x + '",' +
    '"y":"' + key.y + '"' +
    '}';
}

/*
 * Takes in a JWK object representing an ECDSA key (public or private)
 * and returns a reproducible hash for it.
 */
async function userIDFromPublicKey (publicKey : any) {
  const stringifiedPublicKey = stringifyPublicKey(publicKey);

  const encoder = new TextEncoder();
  const encodedPublicKey = encoder.encode(stringifiedPublicKey);

  // userID is a SHA-256 hash of the user public key
  const rawPublicKeyHash = await window.crypto.subtle.digest(
    {
      name: 'SHA-256'
    },
    encodedPublicKey
  );

  const stringifiedPublicKeyHash = ArrayBufferToString(rawPublicKeyHash);

  return stringifiedPublicKeyHash;
}

/*
 * Returns new key pair (as objects), and derived userID
 */
async function generateUserKeys () {
  // Test endiadness
  if (!systemIsLittleEndian()) {
    console.warn('generateUserKeys: System is big-endian, aray buffers (and by extension Subtle Crypto might behave oddly.');
  }

  // Generate new ECDSA P-256 key pair
  const keys = await window.crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    true, // The key is extractable so it can be saved into storage
    ['sign'] // Will be used for signing (of submissions)
  );

  const privateKeyData = await window.crypto.subtle.exportKey('jwk', keys.privateKey);

  const userID = await userIDFromPublicKey(privateKeyData);

  const data = {
    userID: userID,
    privateKey: privateKeyData
  };

  chrome.storage.sync.set(data);

  return userID;
}

async function signMessage (message: string) {
  const data = <any>(await storageGet('privateKey'));

  const privateKeyData = data.privateKey;

  const privateKey = await window.crypto.subtle.importKey(
    'jwk',
    privateKeyData,
    {
      name: 'ECDSA',
      namedCurve: privateKeyData.crv
    },
    false,
    ['sign']
  );

  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(message);
  // userID is a SHA-256 hash of the user public key
  const signature = await window.crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: 'SHA-256'
    },
    privateKey,
    encodedMessage
  );

  const stringifiedSignature = ArrayBufferToString(signature);

  return stringifiedSignature;
}

async function verifyMessage (message: any) {
  return true
}

function exportKey (callback : any) {
  chrome.storage.sync.get(['userID', 'privateKey'], data => {
    const userID = data.userID;
    const privateKey = data.privateKey;
    if (!privateKey || !userID) {
      return null;
    }
    // Export only the important parameters
    const minimal = {
      userID: userID,
      privateKey: {
        kty: privateKey.kty,
        crv: privateKey.crv,
        x: privateKey.x,
        y: privateKey.y,
        d: privateKey.d
      }
    };

    callback(minimal);
  });
}

async function importKey (privateKey : any) {
  // TODO: try to import the key to validate if it will sign stuff
  if (privateKey.kty !== 'EC' || privateKey.crv !== 'P-256' || !privateKey.x || !privateKey.y || !privateKey.d) {
    throw new TypeError('Incorrect or unsupported key');
  }

  const userID = await userIDFromPublicKey(privateKey);

  const data = {
    userID: userID,
    privateKey: privateKey
  };

  chrome.storage.sync.set(data);

  return userID;
}

export { generateUserKeys, signMessage, verifyMessage, exportKey, importKey };
