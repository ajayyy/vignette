'use strict';

const crypto = require('crypto');
const jwkToPem = require('jwk-to-pem');

function sign (privateJWK, data) {
  const privatePEM = jwkToPem(privateJWK, { private: true });
  const signer = crypto.createSign('sha256');
  signer.update(data);
  const signature = signer.sign(privatePEM, 'base64');
  return signature;
}

function validateSignature (publicJWK, signature, data) {
  const publicPEM = jwkToPem(publicJWK);
  const verifier = crypto.createVerify('sha256');
  verifier.update(data);
  const valid = verifier.verify(publicPEM, signature, 'base64');
  return valid;
}

function validateSignatureExpress (req, res, next) {
  const publicJWK = null;
  const signature = req.body.signature;
  const data = req.body.data;
  const valid = validateSignature(publicJWK, signature, data);
  console.log(JSON.stringify(req.body));
  console.log(valid);
  next();
}

module.exports = {
  validateExpress: validateSignatureExpress,
  validate: validateSignature,
  sign: sign
};
