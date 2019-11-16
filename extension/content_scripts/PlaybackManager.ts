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
  private _videoNode: HTMLVideoElement;
  private _segments: Array<SegmentClientside>;
  private _ontimeupdateInstance: (event: Event) => void;
  constructor (videoNode: HTMLVideoElement, segments: Array<SegmentClientside>) {
    this._videoNode = videoNode;
    // Set via the actual setter
    this._segments = segments;
    this._ontimeupdateInstance = (event) => { this._ontimeupdate(this, event); };
    this._setSegments(segments);
  }

  /*
   * Gets run on every <video> timeupdate event.
   * TODO: This is run 4 times a second,
   *       which might or might not slow down the page.
   *       Consider using setInterval and similar functions
   *       to run code.
   */
  _ontimeupdate (playbackManager: PlaybackManager, event: Event) {
    const segments = playbackManager._segments;
    const videoNode = <HTMLVideoElement>event.target;
    if (!segments) {
      // Nothing to skip
      console.warn('Unnecessary timeupdate event listener.' + segments);
      return;
    }

    const currentTime = videoNode.currentTime;
    for (const segment of segments) {
      if (!segment.disabled && segment.startTime <= currentTime && currentTime < segment.endTime) {
        console.info('PlaybackManager: _ontimeupdate skip to ' + segment.endTime);
        videoNode.currentTime = segment.endTime;
      }
    }
  }

  _setSegments (value: Array<SegmentClientside>) {
    if (this._ontimeupdateInstance) {
      this._videoNode.removeEventListener('timeupdate', this._ontimeupdateInstance);
    }
    this._segments = value;
    /* Register event listener only if necessary */
    if (this._segments.length > 0) {
      this._videoNode.addEventListener('timeupdate', this._ontimeupdateInstance);
    }
  }

  /*
   * Update segments and (if applicable) register ontimeupdate listener.
   */
  set segments (value: Array<SegmentClientside>) {
    this._setSegments(value);
  }

  /*
   * Clean up.
   */
  destructor () {
    this._videoNode.removeEventListener('timeupdate', this._ontimeupdateInstance);
    this._videoNode = null;
    this._segments = null;
  }
}

export { PlaybackManager };
