# Client and Sever API: Cryptography

See also: [Client and Sever API](API.md).

Disclaimer: Obviously, public key crypto might seem like an overkill for this application... and it actually is. Author decided to use it not because of some formal requirement, but just because it's fun. Also, it server as a challenge to develop skills and implement a system impervious to password leaks.

TL;DR: The database uses ECDSA cryptosystem on named curve P-256 and SHA-256 hashes. Users are identified by the hashes of their public keys. Every POST API transaction (database write) is signed individually by the data submitter. Optionally, users can provide a human-readable nick names. For now, users can not change their public key, but this feature will be implemented after it's clear that the proposal is reasonable (see end of the file for the proposal).

## Design
### Design goals
 - Servers can be operated by mutually distrusting parties
   - Database can be posted verbatim on the internet, without compromising user security
   - Every record is verifiable
   - Clients can use the same credentials without compromising thir accounts on other servers
 - Efficiency
   - Can prevent spam (are not obligated to accept submissions from spammers)
   - No unnecessary network acivity like requesting session tokens
 - Seamless for the end users: _It just works!_

### Solution: Tried-and-proven cryptography

You might be reading this and thinking "ECDSA, curve P-256, and SHA-256? This looks a lot like TLS PKI / Bitcoin!" That's exactly the intention here. I do not invent anything, just use the common tools as intended.

## User identities

Users are identified by the SHA-256 hashes of their public key on ECDSA curve P-256.

## Records

Database must be able to produce every valid submission along with its original signature. Data is passed around in stingified JSON (at least for now) to avoid ambuguity in JSON serializaton.

In reality, database might contain a separate record store in more efficient format (for indexing and such).

However, every transaction is signed individually so that the server can later evict undesired ones (e.g., if later user rewokes them or it is determined to be invalid or spam, for example.) Also, database is not obligated to serve any specific client, to, e.g. awoid spam.

## Future

**Note: Feedback is welcome! Please open an issue to discuss your ideas.**

### Swithing to a new private key

By definition, if someone compromised your account's private key (or password or access token in a HTTP Cookie or other means of authentication), you have a problem. The Adversary has your means of authentication and there is really no way for the server to distinguish you from the Adversary.

A common solution is to have a multi-factor authentication or backup authentication or wahtewer, but all of these boil down to: "Let's use another secret, but this time we'll keep it secure!". The only reasonable way to do that is to have a backup key (not actively used and may be even kept in "cold storage"). I personally am very excited about the U2F keys as an augmentation to other authentication methods. So, if possible, I'd like to use hardware U2F keys as a backup mechanism. I do believe that the keys require an active external server, but the server can act as a dumb mirror, e.g. the server challenge will be derived from the client-provided information like the hash of the old public key.

I do not use U2F for signing _every_ server interaction because most keys require physical interaction on every authentication. (As they should do to prevent abuse.)
