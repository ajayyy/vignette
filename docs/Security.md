# Security

This extension and its server are basically exercises in secure and efficient
software development so

This document contains a brief overview of security features and their
limitations. If you have an idea for improving security practices, please open
an issue to discuss them. Also, this document will be helpful if you want to
self-host the server.

## Transport Layer Security

Security measures:
 - Forbid insecure plaintext communication
   - Content Security Policy
     Extension context security policy includes `connect-src https://*;`, which
     forbids plaintext HTTP connections. If you want to use local server with
     HTTP (localhost or local subnet IP), please open an issue.
   - HTTP Strict Transport Security
     The server domain is in DEV namespace which is HSTS preloaded, so browsers
     will automatically upgrade HTTP requests to HTTPS.
 - Certificate management
   The extension site uses Certificate Transparency to ensure no miss-issued
   certificate can ever be use used in MITM attack. The defenses are based on
   a chain of measures (all of which have to be satisfied for maximum assurance):
   - DNSSEC
     All DNS records are signed by the site domain's registry, DEV, which is
     managed by Google, with keys controlled by Google. The registry's keys are
     in turn signed with ICANN-managed keys.
     Useful tools: https://www.internetsociety.org/deploy360/dnssec/tools
   - DNS Certificate Authority Authorization
     CAA record is secured by secured by DNSSEC. Any CA that participates in
     CA/Browser forum is required to check CAA record before issuing a new
     certificate, preventing before It is an indication for any CA
     that It is a DNS record that restricts which Certificate Authority can issue
     TLS certificate for the site's domain.
   -
 - Use strong ciphers
   All communications with the server are secured with TLS 1.2 and strong
   ciphers recommended by RFC 7525. The server is configured for non-default
   strong DH parameters.
 - The server uses 2048-bit RSA keys matching YouTube's own key size (as opposed
   to 4096-bit keys) to avoid undue burden on the client devices.
