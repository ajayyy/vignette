// This code is adapted from VideoSegments
// https://github.com/videosegments/videosegments/blob/master/player/player.js
// Usage: pass into constructor the callback that takes reference to
// <video> node and a boolean to "mute" play event and listens to video,
// and then returns a clean up callback to destroy it.

/* eslint-disable */

/*
  VideoSegments. Extension to Cut YouTube Videos.
  Copyright (C) 2017-2019  Alex Lys
  This file is part of VideoSegments.
  VideoSegments is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  VideoSegments is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with VideoSegments. If not, see <https://www.gnu.org/licenses/>.
*/

'use strict';

class NavigationManager {
  private collection : any;
  private callback : any;
  private destructorCallback : any;
  private observer : any;
  constructor(callback : any) {
    // look into HTMLcollection instead of hundreds of mutations
    // https://stackoverflow.com/a/39332340
    this.collection = document.getElementsByTagName('video');
    this.callback = callback;
    this.destructorCallback = null;

    // observe mutations in window.body
    this.observer = new MutationObserver(() => {
      this.onBodyMutations()
    });
    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  onBodyMutations() {
    // if "video" element exists
    if (this.collection[0] && this.collection[0].src) {
      // disable observing of window.body mutations
      this.observer.disconnect();

      // start observing for video.src changes
      this.observer = new MutationObserver(() => {
        this.onVideoChanges()
      });
      this.observer.observe(this.collection[0], {
        attributes: true,
        attributeFilter: ['src']
      });

      // start video player wrapper
      this.destructorCallback = this.callback(this.collection[0]);
    }
  }

  onVideoChanges() {
    // disconnect observer
    this.observer.disconnect();

    // observe mutations in window.body
    this.observer = new MutationObserver(() => {
      this.onBodyMutations()
    });
    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    // cleanup player
    if (this.destructorCallback) {
      this.destructorCallback();
    }
  }
}

export { NavigationManager };
