'use strict';

/*
 * Imports
 */
import { PlaybackManager } from './PlaybackManager.ts';
import { SegmentsBar } from './SegmentsBar.ts';
import { TranscriptManager } from './TranscriptManager.ts';
import { SubmissionManager } from './SubmissionManager.ts';

const options = require('../options.json');
// Extracts videoID from URLs (and iframe src attributes)
const getVideoID = require('get-video-id');
const NavigationManager = require('./NavigationManager.js');

// Note: options are later modified, in place
let playbackManager : PlaybackManager = null;
let segmentsBar : SegmentsBar = null;
let transcriptManager : TranscriptManager = null;
let submissionManager : SubmissionManager = null;

// Listen for future navigations
const navigationManager = new NavigationManager(onNavigation);
console.log('navigationManager = ', navigationManager);

/*
 * Merges base and owerrides into base
 * Warning: owerrides base!
 */
// TODO: prevent cyclical references
function mergeInPlace (base : any, owerrides : any) {
  for (const key in owerrides) {
    if (typeof owerrides[key] === 'object') {
      mergeInPlace(base[key], owerrides[key]);
    } else {
      base[key] = owerrides[key];
    }
  }
}

// Update options as they are loaded,
// but do not block display of anything else
chrome.storage.sync.get(['options'], data => {
  mergeInPlace(options, data.options);

  // Update all components, if needed
  if (segmentsBar) {
    segmentsBar.options = options.segmentsBar;
  }
});

function destructors () {
  // Clean up old stuff
  if (playbackManager) {
    playbackManager.destructor();
    playbackManager = null;
  }
  if (segmentsBar) {
    segmentsBar.destructor();
    segmentsBar = null;
  }
  if (transcriptManager) {
    transcriptManager.destructor();
    transcriptManager = null;
  }
  if (submissionManager) {
    submissionManager.destructor();
    submissionManager = null;
  }
}

function onNavigation (videoNode : HTMLVideoElement) {
  const videoInfo = getVideoID(window.location.href);
  const videoID = videoInfo.id;
  console.log('Navigation: ' + videoID);

  destructors();

  const message = {
    type: 'getVideoSegments',
    platform: videoInfo.service,
    videoID: videoID
  };

  // Retreive all segment info
  chrome.runtime.sendMessage(message, response => {
    console.error(response);
    if (!(response && response.segments && response.segments.length)) {
      console.info('No segments found...');
    }

    const segments = (response && response.segments) ? response.segments : [];

    playbackManager = new PlaybackManager(videoNode, segments);

    executeWhenDOMnodesLoaded(['DIV.ytp-progress-list'], (parentNode : any) => {
      const segmentsBarOptions = options.segmentsBar;
      segmentsBar = new SegmentsBar(parentNode[0], videoNode, segmentsBarOptions, segments);
    });

    executeWhenDOMnodesLoaded(['DIV#panels'], (nodes : any) => {
      const panels = nodes[0];
      const customPanels = document.createElement('DIV');
      const submissionManagerPanel = document.createElement('DIV');
      const transcriptManagerPanel = document.createElement('DIV');
      customPanels.appendChild(submissionManagerPanel);
      customPanels.appendChild(transcriptManagerPanel);
      panels.after(customPanels);

      const submissionManagerOptions = options.submissionManager;
      submissionManager = new SubmissionManager(submissionManagerPanel, submissionManagerOptions, segments, onUserInput);

      executeWhenDOMnodesLoaded(['BUTTON.ytp-subtitles-button'], (nodes : any) => {
        const transcriptManagerOptions = options.transcriptManager;
        transcriptManager = new TranscriptManager([transcriptManagerPanel, nodes[0]], transcriptManagerOptions, segments, onUserInput);
        transcriptManager.openPanel();
      });
    });
  });

  // TODO: check if <video> node chabged

  function destructor () {
    console.log('Destroyed');
  }
  return destructor;
}

function onUserInput (message : any) {
  switch (message.type) {
    case 'segmentsChanged':
      if (playbackManager) {
        playbackManager.segments = message.segments;
      }
      if (segmentsBar) {
        segmentsBar.segments = message.segments;
      }
      if (transcriptManager) {
        transcriptManager.segments = message.segments;
      }
      if (submissionManager) {
        submissionManager.segments = message.segments;
      }
      break;
  }
}

/*
 * Waits until the relevant page content is loaded
 * and executes the second callback.
 *
 * @param selector -- callback that returns an object with all relevant DOM nodes
 * that will be relayed to callback or returns something that evaluates to false
 * if they are not available
 * @param callback -- callback that takes in object returned by selecor and
 * performs all DOM manipulations
 * @param timeInterval -- how often to check for DOM nodes, in milliseconds.
 */
function executeWhenDOMnodesLoaded (selectors : Array<string>, callback : (nodes: Array<any>) => void, timeInterval = 100) {
  const nodes = [];
  for (const selector of selectors) {
    const node = document.querySelector(selector);
    nodes.push(node);
    if (!node) {
      // The relevant section of the page hasn't loaded yet,
      // schedule the next call
      setTimeout(() => { executeWhenDOMnodesLoaded(selectors, callback, timeInterval); }, timeInterval);
      return;
    }
  }
  // The relevant section of the page was loaded, execute callback
  callback(nodes);
}
