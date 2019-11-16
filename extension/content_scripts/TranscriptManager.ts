'use strict';
/*
 * TODO: Use # instead of _ for private elements
 * Need to fix loader problem.
 */

/*
 * This class collects information about the video captions text produced
 * by YouTube and accurate to within millisecons of when each individual
 * work is spoken this allows to just to look at the transcript, select
 * portions and mark them as a "intro", "sponsor", etc. and have precise
 * timing data produced automatically.
 */

/*
 * Captions manager
 *
 * Lifecycle:
 *  1. Create an instance with
 *     new Captions(...)
 *  2. Use it, update it
 *  3. Free all resources with
 *     destructor() and only then set
 *     pointer to it to null.
 */
class TranscriptManager {
  private _parentNode: HTMLElement;
  private _panel: HTMLElement;
  private _transcriptNode: HTMLElement;
  private _button: any;
  private _options: any;
  private _segments: Array<Segment>;
  private _onUserInput: any;
  private _ontimedtextInstance: any;
  private _buttonpressInstance: any;
  private _onselectionchangeInstance: any;
  private _timedTextURL: any;
  private _state: any;
  private _selectionLast: any;
  private _selectionCurr: any;
  private _transcriptHTML: string;

  constructor (nodes: any, options: any, segments: Array<Segment>, oninput: any) {
    this._parentNode = nodes[0];
    this._button = nodes[1];
    this._options = options;
    this._segments = segments;
    this._onUserInput = oninput;
    // Store URLs to avoid triggering Captions sisplay unnecessarily.

    // state is one of: null, opening, open
    this._state = null;

    // Listen for text selections
    this._panel = null;
    this._transcriptNode = null;
    this._onselectionchangeInstance = null;
    this._selectionLast = null;
    this._selectionCurr = null;

    // Listen for timedtext
    this._timedTextURL = null;
    const transcriptManager = this;
    this._ontimedtextInstance = (event: CustomEvent) => { this._ontimedtext(event, transcriptManager); };
    document.addEventListener('timedtextrequest', this._ontimedtextInstance);
    this._interceptor();
  }

  _informOthersOfSegmentsUpdate (segments: Array<Segment>) {
    const message = {
      type: 'segmentsChanged',
      segments: segments
    };
    this._onUserInput(message);
  }

  _ontimedtext (event: CustomEvent, transcriptManager: TranscriptManager) {
    const interceptedURL = event.detail;
    transcriptManager._timedTextURL = interceptedURL;
    if (this._panel === null && this._state === null) {
      this._state = 'opening';
      this._fetchText();
    }
  }

  /*
   * Injects code into the main tab context to intercept captions.
   */
  _interceptor () {
    const payloadCode = '(' + interceptorPayload.toString() + ')()';

    document.documentElement.setAttribute('onreset', payloadCode);
    document.documentElement.dispatchEvent(new CustomEvent('reset'));
    document.documentElement.removeAttribute('onreset');
  }

  _selectionToTime (selection: any, transcriptNode: HTMLElement) {
    /*
     * Checks if the node is within the transcriptNode
     * @param node to check
     * @returns boolean
     */
    function isWithin (node: HTMLElement, presumedParent: HTMLElement) {
      for (let current: HTMLElement = node; current; current = (<any>current).parentNode) {
        if (current.parentNode === presumedParent) {
          return true;
        }
      }
      return false;
    }

    function timeOfSelection (node: HTMLElement, transcriptRoot: HTMLElement) {
      try {
        let startTime = 0;
        for (let currentNode: any = node; currentNode && currentNode !== transcriptRoot; currentNode = (<any>currentNode).parentNode) {
          const t = currentNode.getAttribute && parseInt(currentNode.getAttribute('t'));
          startTime += t || 0;
        }
        const endTime = startTime + 500; // parseInt(node.getAttribute('ac'));
        console.log(node, startTime, endTime);
        //        if (a.nextSibling) {
        //          endTime = parseInt(a.nextSibling.getAttribute('timeStart'));
        //        }
        return {
          startTime: startTime / 1000,
          endTime: endTime / 1000,
          type: <string>null
        };
      } catch (e) {
        console.error('timeOfSelection: can\'t process ', node);
      }
    }

    // Note: isCollapsed indicates that no text is selected
    if (selection && selection.isCollapsed === false &&
      isWithin(selection.anchorNode, transcriptNode) &&
      isWithin(selection.focusNode, transcriptNode)) {
      // This is a valid selection
      let time1 = timeOfSelection(selection.anchorNode, transcriptNode);
      let time2 = timeOfSelection(selection.focusNode, transcriptNode);
      if (time1.startTime > time2.startTime) {
        const temp = time1;
        time1 = time2;
        time2 = temp;
      }
      const newSegment = {
        startTime: time1.startTime,
        endTime: time2.endTime
      };
      return newSegment;
    }
  }

  _createPanelDOM (text: string) {
    /*
     * For some reason the original selection object
     * gets replaced with  a new one, so we have to keep
     * the desired parts elsewhere.
     */
    function cherryPickSelection (selection: any) {
      return {
        anchorNode: selection.anchorNode,
        anchorOffset: selection.anchorOffset,
        focusNode: selection.focusNode,
        focusOffset: selection.focusOffset,
        isCollapsed: selection.isCollapsed
      };
    }

    /*
     * Updates selection. This is necessary because when user clicks
     * on the button, selection info is updated to point to button.
     * This just stores the two most recent selections, so
     * on button click transcriptManager._selectionLast contains the desired one.
     */
    function onselectionchage (event: Event, transcriptManager: TranscriptManager) {
      transcriptManager._selectionLast = transcriptManager._selectionCurr;
      transcriptManager._selectionCurr = cherryPickSelection(document.getSelection());
    }

    function onbuttonpress (event: Event, transcriptManager: TranscriptManager, transcriptNode: HTMLElement) {
      // No need to bother the rest of YouTube with this
      event.stopPropagation();

      const selection = transcriptManager._selectionLast;
      if (!selection) {
        return;
      }

      const newSegment: any = transcriptManager._selectionToTime(selection, transcriptNode);
      if (!newSegment) {
        return;
      }

      const type = (<HTMLElement>event.target).getAttribute('data-type');

      newSegment.type = type;

      // Check that everything that we expect to be here is actually here
      if (type && newSegment) {
        newSegment.type = type;

        transcriptManager._segments.push(newSegment);

        transcriptManager._informOthersOfSegmentsUpdate(transcriptManager._segments);
        transcriptManager._highlights(transcriptManager);

        // Clear past selection (to prevent clicking on another button)
        transcriptManager._selectionCurr = null;
        transcriptManager._selectionLast = null;
      }
    }

    function createButtons () {
      const types = ['none', 'other', 'intro', 'logo', 'sponsor', 'merch', 'social', 'buttons', 'patreon'];

      const buttons = document.createElement('DIV');
      buttons.style.display = 'block';
      buttons.style.fontSize = '16px';

      for (const type of types) {
        const button = document.createElement('DIV');
        button.style.display = 'inline-block';
        button.style.padding = '10px';
        button.innerText = type;
        button.setAttribute('data-type', type);
        buttons.appendChild(button);
      }

      return buttons;
    }

    const panel = document.createElement('DIV');
    const buttons = createButtons();
    panel.appendChild(buttons);

    // Create transcript panel
    const transcript: HTMLElement = document.createElement('DIV');
    transcript.style.fontSize = '14px';
    transcript.innerHTML = text;

    this._transcriptNode = transcript;

    this._panel = panel;

    // TODO: listen only to transcript node and only selectionend?
    const transcriptManager = this;
    this._onselectionchangeInstance = (event: Event) => onselectionchage(event, transcriptManager);
    document.addEventListener('selectionchange', this._onselectionchangeInstance);

    this._buttonpressInstance = (event: Event) => onbuttonpress(event, transcriptManager, transcript);
    buttons.addEventListener('click', this._buttonpressInstance);

    this._highlights(this);
    panel.appendChild(transcript);
    this._parentNode.appendChild(panel);
  }

  /*
   * Highlights the text with the appropriate background
   * based on segments.
   */
  _highlights (transcriptManager: TranscriptManager) {
    const transcriptNode = transcriptManager._transcriptNode;
    const colors = transcriptManager._options.segmentsBar.colors;
    const segments = transcriptManager._segments;
    for (const segment of segments) {
      for (const a of <any>transcriptNode.getElementsByTagName('a')) {
        const timeStart = parseInt(a.getAttribute('timeStart')) / 1000;
        let timeEnd = 1000000000000;
        if (a.nextSibling) {
          timeEnd = parseInt(a.nextSibling.getAttribute('timeStart')) / 1000;
        }
        if (segment.startTime <= timeStart && timeEnd <= segment.endTime) {
          const color = colors[segment.type];
          a.style.backgroundColor = color;
        }
      }
    }
  }

  // TODO: more testing, whole paragraphs, and spaces
  _parseXML (xml: string) {
    // Array of words to be returned
    const start = xml.indexOf('<body>');
    const end = xml.indexOf('</body>') + '</body>'.length;
    const body = xml.substring(start, end);
    const noW = body.replace(/<w[\s\w="']*\/>/, '');
    const final = noW.replace(/<s\s/g, '<a ').replace(/<\/s>/g, '</a>');
    return final;
  }

  _fetchText () {
    fetch(this._timedTextURL)
      .then(response => response.text())
      .then(xml => this._parseXML(xml))
      .then(html => {
        this._transcriptHTML = html;
        this._createPanelDOM(html);
      });
    // .catch(error => console.error('TranscriptManager: fetch failed'))
  }

  _createPanel () {
    this._button.click();
    this._button.click();
  }

  openPanel () {
    this._createPanel();
  }

  set segments (value: any) {
    this._segments = value;
    // TODO: redraw, if needed
  }

  /*
   * Frees all internal variables
   */
  destructor () {
    document.removeEventListener('timedtextrequest', this._ontimedtextInstance);
    this._ontimedtextInstance = null;

    if (this._panel) {
      this._panel.remove();
      this._panel = null;
    }
  }
}

/*
 * This script injects shim directly into YouTube
 * function downloading precise captions
 * and hadles communications with it.
 */

/*
 * This code is executed in the page context.
 */

/* _yt_player is a global defined in the page context. */
/* eslint-disable-next-line camelcase */
declare let _yt_player: any;
function interceptorPayload () {
  const key = 'Ap';

  // Wait untill YouTube loads
  const real = _yt_player[key];

  if ((<any>window).alreadyInjected) {
    // Already injected, nothing else to do
    return;
  }

  function interceptor (url: any, params: any) {
    // Interested only if it is a request for detailed captions
    const interested = url.startsWith('https://www.youtube.com/api/timedtext');
    if (interested) {
      // If interested, pass along the data
      const event = new CustomEvent('timedtextrequest', { detail: url });
      document.dispatchEvent(event);
    }
    return real(url, params);
  }

  try {
    _yt_player[key] = interceptor;
    (<any>window).alreadyInjected = true;
  } catch (e) {
    setTimeout(interceptorPayload, 100);
  }
}

export { TranscriptManager };
