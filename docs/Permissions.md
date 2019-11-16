# Extension Permissions

## Required permissions

### Storage

This extension needs to store your preferences (like the colors of the segments on wideo playback bar), your private and public keys (which you can reset) and your yet unsubmitted video segments. 

### Site access

This extension needs access to `<video>` elements to control their playback and the video playback UIs. All sites that this extension supports and requests access to can be viewed in the browser options menu. Furthermore, in Chrome you can revoke permissions per site.

## Optional permissions

This extension does not have optional permissions yet.

## Permissions that this extension does not have

This ectension is built not to have powerfull permissions, even if powerfull permission would simplify development. In particular, extension needs to intercet timedtext requests from YouTube because they are signed by YouTube frame, but it does it without a very powerful `"webRequests"` permission. Instead, it injects a payload into the page context and intercepts only the relevant requests.
