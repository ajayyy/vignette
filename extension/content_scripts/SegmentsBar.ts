'use strict';

/*
 * TODO: Use # instead of _ for private elements
 * Need to fix loader problem.
 */

/*
 * Segments bar
 *
 * Lifecycle:
 *  1. Create an instance with
 *     new SegmentsBar(...)
 *  2. Use it, update it
 *  3. Free all resources with
 *     destructor() and only then set
 *     pointer to it to null.
 */
export class SegmentsBar {
  private _parentNode: HTMLElement;
  private _videoNode: HTMLVideoElement;
  private _DOMcontainer: HTMLElement;
  private _options: any;
  private _segments: Array<Segment>;
  private _durationChangeListener: (event: Event) => void;

  // options -- an object created from options.segmentsBar and defaultOptions.segmentsBar
  // videoInfo duraion
  constructor (parentNode: HTMLElement, videoNode: HTMLVideoElement, segmentsBarOptions: HTMLElement, segments: Array<Segment>) {
    // The container for all segments
    this._parentNode = parentNode; // TODO: immutable
    this._videoNode = videoNode;
    // All options are stored here
    this._options = segmentsBarOptions;
    // All segment bars are children of this node
    this._segments = segments;
    this._DOMcontainer = null;

    // Do not create the bar at all, if it is not needed
    if (!this._options.enabled) {
      return;
    }

    this._redrawBar();

    const segmentsBar = this;
    this._durationChangeListener = (event: Event) => {
      // Force-redraw nodes
      segmentsBar._redrawBar();
    };
    videoNode.addEventListener('durationchange', this._durationChangeListener);
  }

  _createDOMContainer () {
    const container = document.createElement('UL');
    container.id = 'segmentsBar';
    container.style.margin = '0px';
    container.style.padding = '0px';
    container.style.height = '100%';
    container.style.listStyleType = 'none';
    return container;
  }

  /*
   * Frees all internal variables
   */
  destructor () {
    this._videoNode.removeEventListener('durationchange', this._durationChangeListener);
    this._durationChangeListener = null;
    if (this._DOMcontainer) {
      this._DOMcontainer.remove();
    }
    this._DOMcontainer = null;
    this._parentNode = null;
    this._options = null;
    this._videoNode = null;
  }

  addSegment (segment: Segment, container: HTMLElement) {
    const videoDuration = this._videoNode.duration;
    const width = (segment.endTime - segment.startTime) / videoDuration * 100;
    const left = segment.startTime / videoDuration * 100;
    const node = document.createElement('LI');

    node.style.backgroundColor = this._options.colors[segment.type];
    node.style.opacity = '1';
    node.style.position = 'absolute';
    node.style.zIndex = '1000';
    node.style.height = '100%';
    node.style.width = width + '%';
    node.style.left = left + '%';

    container.appendChild(node);
  }

  removeSegment () {
    // TODO
  }

  set options (value: any) {
    this._options = value;
    // Options changed, redraw
    this._redrawBar();
  }

  _redrawBar () {
    // Do nothing, if segments bar is not enabled
    if (!this._options.enabled) {
      return;
    }

    const newContainer = this._createDOMContainer();

    for (const segment of this._segments) {
      this.addSegment(segment, newContainer);
    }

    if (this._DOMcontainer) {
      this._DOMcontainer.remove();
    }

    // Display the container node all once all segments are added
    // to avoid redraws.
    this._parentNode.insertAdjacentElement('beforeend', newContainer);
    this._DOMcontainer = newContainer;
  }

  /*
   * TODO: do nothing while bar is hidden, but then update
   */
  set segments (value: Array<Segment>) {
    this._segments = value;
    this._redrawBar();
  }
}
