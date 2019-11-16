'use strict';

import 'jasmine';

const customCrypto = require('./crypto.ts');

describe('Server crypto utilities', function () {
  const privateJWK = {
    kty: 'EC',
    crv: 'P-256',
    x: 'KD016gqn-gwiEupvNheLplW99ZbCS-zGO5duEWNSMXQ',
    y: 's7l85Bk6Wa0xvTcum9K6WuldGhk8j8loVCnq_Lkq0gI',
    d: 'xGJwG3AqTTwD8BCl-2y_KJ_QsOhJCbCIl_U3f96Lckk'
  };

  const publicJWK = {
    kty: 'EC',
    crv: 'P-256',
    x: 'KD016gqn-gwiEupvNheLplW99ZbCS-zGO5duEWNSMXQ',
    y: 's7l85Bk6Wa0xvTcum9K6WuldGhk8j8loVCnq_Lkq0gI'
  };

  const data = 'Hello World!';

  it('sign and then check the signature', function () {
    const signature = customCrypto.sign(privateJWK, data).toString();
    const valid = customCrypto.validate(publicJWK, signature, data);
    expect(valid).toBe(true);
  });
});
