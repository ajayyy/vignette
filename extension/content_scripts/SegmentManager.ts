'use strict';

/*
 * TODO: Use # instead of _ for private elements
 */

/*
 * This class stores segments and makes sure they do not overlap.
 * Lifecycle:
 *  1. Create an instance with
 *     new SubmissionManager(...)
 *  2. Use it, update it
 *  3. Free all resources with
 *     destructor() and only then set
 *     pointer to it to null.
 */
class SegmentManager {
  private _segments : any;
  private _videoDuration : any;
  constructor (segments : any, videoDuration : any) {
    // segments is a sorted array
    this._segments = segments;
    this._videoDuration = videoDuration;
  }

  addSegment (segment : any) {

  }

  get segments () {
    return this._segments;
  }

  _setSegments (value : any) {
    this._segments = value;
  }

  set segments (value : any) {
    this._setSegments(value);
  }

  /*
   * Clean up.
   */
  destructor () {
    this._segments = null;
  }
}

export { SegmentManager };
