'use strict';

import { Platform } from '../../types/enums.ts';

/*
 * TODO: Use # instead of _ for private elements
 * Need to fix loader problem.
 */

/*
 * Lifecycle:
 *  1. Create an instance with
 *     new SubmissionManager(...)
 *  2. Use it, update it
 *  3. Free all resources with
 *     destructor() and only then set
 *     pointer to it to null.
 */
class SubmissionManager {
  private _parentNode: HTMLElement;
  private _segments: Array<Segment>;
  private _panel: HTMLElement;
  private _onUserInput: (message: any) => void;
  private _options: any;
  constructor (parentNode: HTMLElement, options: any, segments: Array<Segment>, oninput: any) {
    this._parentNode = parentNode;
    this._options = options;
    this._segments = segments;
    this._onUserInput = oninput;
    this._panel = null;
    this._redraw();
  }

  _informOthersOfSegmentsUpdate (segments: Array<Segment>) {
    const message = {
      type: 'segmentsChanged',
      segments: segments
    };
    this._onUserInput(message);
  }

  _segmentStart (event: Event) {

  }

  _secondsToText (numberOfSeconds: number) {
    const seconds = (numberOfSeconds % 60).toFixed(2);
    const minutes = Math.floor(numberOfSeconds / 60) % 60;
    const hours = Math.floor(numberOfSeconds / 60 / 60) % 24;
    const days = Math.floor(numberOfSeconds / 60 / 60 / 24);
    let text = '';
    if (days) {
      text += days + 'd ';
    }
    if (hours) {
      text += hours + ':';
    }
    text += minutes + ':' + seconds;
    return text;
  }

  _submitSegments () {
    console.log('_submitSegments', this._segments);
    const data = {
      segments: this._segments,
      platform: Platform.YouTube,
      videoID: <string>null
    };

    function onResponse (response : any) {
      console.error(response);
    }
    chrome.runtime.sendMessage(data, onResponse);
  }

  _redrawNoSegments (panel: HTMLElement) {
    const p = document.createElement('P');
    p.innerText = chrome.i18n.getMessage('submissionManager_no_segments');
    panel.appendChild(p);
  }

  _redrawSegments (panel: HTMLElement) {
    const ul: HTMLUListElement = <HTMLUListElement>document.createElement('UL');
    ul.style.listStyle = 'none';

    for (let segmentIndex = 0; segmentIndex < this._segments.length; segmentIndex++) {
      const submissionManager = this;
      const segment = this._segments[segmentIndex];
      const li = document.createElement('LI');
      const checkbox: HTMLInputElement = <HTMLInputElement>document.createElement('INPUT');
      const label: HTMLLabelElement = <HTMLLabelElement>document.createElement('LABEL');
      const deleteButton = document.createElement('BUTTON');
      li.style.overflow = 'hidden';
      deleteButton.innerText = chrome.i18n.getMessage('submissionManager_delete_segment');
      deleteButton.style.cssFloat = 'right';
      deleteButton.addEventListener('click', () => {
        submissionManager._segments.splice(segmentIndex, 1);
        submissionManager.segments = submissionManager._segments;
        this._informOthersOfSegmentsUpdate(submissionManager._segments);
      });
      li.appendChild(checkbox);
      li.appendChild(label);
      li.appendChild(deleteButton);
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      label.innerText = segment.type + ': ' + this._secondsToText(segment.startTime) + ' -> ' + this._secondsToText(segment.endTime);
      ul.appendChild(li);
    }
    panel.appendChild(ul);
  }

  _redraw () {
    const panel = document.createElement('DIV');
    panel.style.fontSize = '14px';

    const title = document.createElement('H3');
    title.innerText = chrome.i18n.getMessage('submissionManager_title');
    panel.appendChild(title);

    if (this._segments.length === 0) {
      this._redrawNoSegments(panel);
    }

    if (this._segments.length > 0) {
      this._redrawSegments(panel);
    }

    /*
    const segmentStartButton = document.createElement('BUTTON');
    segmentStartButton.innerText = chrome.i18n.getMessage('submissionManager_segmentStart');
    segmentStartButton.addEventListener('click', this._segmentStart);
    panel.appendChild(segmentStartButton);
    */

    const submitButton = document.createElement('BUTTON');
    submitButton.innerText = chrome.i18n.getMessage('submissionManager_submit');
    submitButton.addEventListener('click', this._submitSegments);
    panel.appendChild(submitButton);

    if (this._panel) {
      this._panel.remove();
      this._panel = null;
    }

    this._parentNode.appendChild(panel);
    this._panel = panel;
  }

  _setSegments (value: Array<Segment>) {
    this._segments = value;
    this._redraw();
  }

  /*
   * Update segments and (if applicable) register ontimeupdate listener.
   */
  set segments (value: Array<Segment>) {
    this._setSegments(value);
  }

  /*
   * Clean up.
   */
  destructor () {
    if (this._panel) {
      this._panel.remove();
      this._panel = null;
    }
    this._segments = null;
  }
}

export { SubmissionManager };
