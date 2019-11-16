# Other extensions doing similar things

## Summary

| Extension      | Privacy                                               | Authentication                                            | Data update           | Segment Categories/Types |
|----------------|-------------------------------------------------------|-----------------------------------------------------------|-----------------------|--------------------------|
| Vignette       | Good                                                  | Strong Public Key cryptography[1]                         | Near real-time        | Any                      |
| SponsorBlock   | Poor: collects viewership information without consent | Non-standard, but not trivially breakable cryptography[2] | Near real-time        | Sponsors only            |
| Video Segments | Good                                                  | Password-based[3]                                         | Near real-time        | No differentiation       |
| Skipper        |                                                       | N/A                                                       | Via extension updates | Music videos only        |

Notes:
 1. Every authenticated message is signed with standard 256-bit ECDSA key. See [Cryptography](Cryptography.md) for details.
 2. Extension generates unique identifier and then submits it as an authentication token, that can never be changed. The server uses non-standard algorithm: server hashes the token 5000 times with strong SHA-256 function and compares to stored a hash. This algorithm is slow (~5000 times slower, obviously), does and does not grant any additional security (there are no publicly known preimage attacks against SHA-256) and instead introduces possibility collisions (intermediate hash collision is more likely than a single hash collision and thus might enable cyclographic (birthday-style) attack). In practice, it's perfectly fine because resources required for finding a hash preimage are still humongous.
 3. Well-implemented conventional email & password authentication, user can change the password (good), but password strength is chosen by user (user can choose weak password).

## Skipper - Music Mode for YouTube™
 - [Chrome store](https://chrome.google.com/webstore/detail/skipper-music-mode-for-yo/chojffponkoboggmjpnkflkbcelacijk)

Users: 1715

Updated: November 17, 2018

Segment detection mechanism: hardcoded, 1222 videos total.

Permissions: "activeTab", "tabs", "storage", "webNavigation"

## SponsorBlock for YouTube™ - Skip Sponsorships
 - [Chrome store](https://chrome.google.com/webstore/detail/sponsorblock-for-youtube/mnjggcdmjocbbbhaepdhchncahnbgone)
 - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/sponsorblock/)
 - [GitHub](https://github.com/ajayyy/SponsorBlock/)

Users (growing): 755 (Chrome) + 893 (Firefox)

Updated: all the time

Permissions: "storage", "notifications"
Sites: "*://*.youtube.com/*"

## Video Segments
 - [Chrome web store](https://chrome.google.com/webstore/detail/cut-youtube-videos-with-v/eddbomdegiekipngdepnddkoemagllbn)
 - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/videosegments/)
 - [GitHub](https://github.com/videosegments/)

Permissions: "unlimitedStorage", "storage", "tabs"


Other interesting stuff
https://chrome.google.com/webstore/detail/invideo-for-youtube/iacbjlffnpbhgkgknabhkfmlcpdcigab
