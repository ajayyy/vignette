# Using password managers

This extension uses public key cryptography to sign the messages sent to the
server. You can export, import and reset your private key on the Options page.
The key is exported in JWK format, which is just a JSON, which in turn is just
text.
You can store your credentials in password manager. If the password manager can
not store the full public key (it's rather long), you can store just your
public key fingerprint (as account name) and private part of key (as password).

## Saving credentials
To save credentials:
 - copy public key fingerprint called "Account identifier" and store it as name
 - copy `d` attribute and save it as password

## Importing keys from password managers
To restore your key from password manager:
 - download your public key based on its fingerprint, also known as your
   "Account identifier"
 - copy content of password field and paste it into `d` attribute of the key
 - import the private key into the extension
