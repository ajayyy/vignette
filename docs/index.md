# Vignette

Vignette is a Chrome and Firefox browser extension that skips boring parts of
YouTube videos for you. Save your valuable time by not watching boring
sponsorship inserts, merch announcements, video intros, and calls, like to
subscribe or leave a comment.

Note: This extension skips parts of the video content itself and not the video
ads served by YouTube.

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

Browser extension can submit user-generated video annotations to the server and
retrieve annotations submitted by other users. Users create the annotation by
highlighting a portion of the video transcript and labeling it with a specific
annotation "category". If a precise transcript is not available, users can
enter time codes manually instead. Every submission is signed by submitter's
private key so authenticity of submission can be verified, even by mutually
distrusting servers.

### Collaboration with SponsorBlock and VideoSegments

{% include images/overview.svg %}

Vignette obtains video annotation information from the following sources:
 - annotations explicitly submitted to VideoSegments by other users
 - annotations known to SponsorBlock and VideoSegments. Unfortunately, SponsorBlock currently supports only `sponsor` category.
 - sometimes, an automatic labeler can create annotations based on the current
   video transcript (submitted by you or another user), and previously submitted
   annotations and transcripts. This is rare right now because the transcript
   set is small.
