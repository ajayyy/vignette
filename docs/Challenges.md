# Fundamental Challenges of accurately editing videos

This document will spare the time of anyone who needs to improve on this extension's code or, may be,  develop a similar extension. This document explains some software design challenges and design decissions made by this extension's author. Also, it describes decissions made by authors of SponsorBlock and VideoSegments.

## Limitations of JavaScript and Browser APIs

### JavaScript APIs lack millisecond-accurate timers

Interfaces like `setTimeout` and `setInterval` take delays in milliseconds, but they do not follow those limits exactly. For one, it's hard to obrain millisecond-accurate timings in general on non-real-time OS. Also, JavaScript is single-threaded so the callback has to wait on the callstack for its turn.

### JavaScript media playback APIs are imprecise

`<video>` element's `timeupdate` event is simplifying the :
 - The event is fired only about 4 times a second (so about every 15 frames at 60 FPS video). This is rather imprecise and insufficient for frame-accurate timings.
 - The event timing might be slightly off.

## There might not be any pause between sponsor and actual content

## Video and Audio might be slightly out of sync

# Fundamental Challenges of dealing with YouTube

## A lot of AJAX and DOM Mutations (on YouTube)

YouTube uses AJAX a lot (does not reload the page even when user navigates to a different video). Instead, it just mutates DOM and updates browser URL via History API. Furthermore, browsers do not fire any event when `window.history.replaceState()` is called. Therefore extensions need to detect video change after the first page load.
SponsorBlock uses `chrome.tabs.onUpdated` in the background, which gets called for all tabs even if they do not contain YouTube videos, on every major tab change. This results means background script is called all the time and effectively becomes persistent.
VideoSegments uses a slightly more elegant method, it watches DOM Mutations. Specifically, it finds the `<video>` element and watches for its `src` attribute -- pretty neat. Unforyunately, the way it initially finds that `<video>` tag is rather ugly: it watches the whole document with its all children, collecting all the mutations untill it finds that one `<video>` tag.

This extension improves utilizes DOM Mutations observer most efficiently: it watches only one element non-recursively at a time.

First, it finds either `<ytd-app>` (desktop) or `<ytm-app>` (mobile) and 

 and This even when the the only way to detect video change 

# Mobile
SponsorBlock and VideoSegments do not support mobile (Firefox for Android) at all.

# Acknowledgements

 - SponsorBlock
 - VideoSegments
