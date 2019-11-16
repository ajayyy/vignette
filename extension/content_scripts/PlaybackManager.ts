'use strict';

/*
 * TODO: Use # instead of _ for private elements
 * Need to fix loader problem.
 */

/*
 * <video> manager
 *
 * Lifecycle:
 *  1. Create an instance with
 *     new PlaybackManager(...)
 *  2. Use it, update it
 *  3. Free all resources with
 *     destructor() and only then set
 *     pointer to it to null.
 */
class PlaybackManager {
  private _videoNode : HTMLVideoElement;
  private _segments : any;
  private _currentListenerInstance : any;
  constructor (videoNode : HTMLVideoElement, segments : any) {
    this._videoNode = videoNode;
    // Set via the actual setter
    this._segments = segments;
    this._currentListenerInstance = null;
    this._setSegments(segments);
  }

  /*
   * Gets run on every <video> timeupdate event.
   * TODO: This is run 4 times a second,
   *       which might or might not slow down the page.
   *       Consider using setInterval and similar functions
   *       to run code.
   */
  _ontimeupdate (segments : any) {
    const videoNode = <HTMLVideoElement>event.target;
    if (!segments) {
      // Nothing to skip
      console.warn('Unnecessary timeupdate event listener.' + segments);
      return;
    }

    const currentTime = videoNode.currentTime;
    for (const segment of segments) {
      if (segment.startTime <= currentTime && currentTime < segment.endTime) {
        console.info('PlaybackManager: this._ontimeupdate skip to ' + segment.endTime);
        videoNode.currentTime = segment.endTime;
      }
    }
  }

  _setSegments (value : any) {
    if (this._currentListenerInstance) {
      this._videoNode.removeEventListener('timeupdate', this._currentListenerInstance);
    }
    this._segments = value;
    /* Register event listener only if necessary */
    if (this._segments.length > 0) {
      const segments = this._segments;
      this._currentListenerInstance = () => { this._ontimeupdate(segments); };
      this._videoNode.addEventListener('timeupdate', this._currentListenerInstance);
    }
  }

  /*
   * Update segments and (if applicable) register ontimeupdate listener.
   */
  set segments (value : any) {
    this._setSegments(value);
  }

  /*
   * Clean up.
   */
  destructor () {
    this._videoNode.removeEventListener('timeupdate', this._currentListenerInstance);
    this._videoNode = null;
    this._segments = null;
  }
}

export { PlaybackManager };
