# Vignette

Vignette is a Chrome and Firefox browser extension that skips boring parts of YouTube videos for you. Save your valuable time by not watching boring sponsorship inserts, merch announcements, video intros, and calls, like to dubscribe or leave a comment.

Vignette is [efficient](Benchmarks.md), [secure](Security.md) and respects your [privacy](Privacy.md).

Contents:
 - [Privacy Policy](Privacy.md)
 - [Extension Permissions](Permissions.md)
 - [Supported Browsers](Browsers.md)
 - [Fundamental Challenges](Challenges.md)
 - [Other extensions](Other.md)
 - [Benchmarks](Benchmarks.md)
 - [API](API.md)
   - [Cryptography](Cryptography.md)

## Overview

Browser extension can submit to and retreive from server video annotations. Users create the annotation by highlighting a portion of the video transcript and labeling it with a specific annotaition "category". If a precise transcript is not available, users can manually use time codes instead. Every submission is signed by submitters's private key so authenticity of submission can be verified, even by mutually distrusting servers.

### Collaboration with SponsorBlock and VideoSegments

{% include images/overview.svg %}

Vignette obtains video annotation information from the following sources:
 - annotations explicitly submitted to VideoSegments by other users
 - annotations known to SponsorBlock and VideoSegments. Unfortunatelly, SponsorBlock currently supports only `sponsor` category.
 - somethimes, an automatic labeler can create annotations based on the current video transcript (submitted by you or another user), and previously submitted annotations and transcripts. This is rare right now because the transcript set is small.
 
