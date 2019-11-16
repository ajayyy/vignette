/*
 * sqlite3 has terrible promisses
 * Need to use something else.
 */

const sponsorBlock = require('./SponsorBlock.js');

let RAMdb = null;

async function open () {
  RAMdb = {};
}

async function close () {
  RAMdb = null;
  // DUMP DB
}

async function querySegmentsForVideo (videoID) {
  let data = RAMdb[videoID];
  if (!data) {
    data = sponsorBlock.querySegmentsForVideo(videoID);
  }
  return new Promise(resolve => resolve(data));
}

async function saveSegmentsForVideo (videoID, timestamp, data) {
  RAMdb[videoID][timestamp] = data;
  return new Promise(resolve => resolve(true));
}

module.exports = {
  open: open,
  close: close,
  query: querySegmentsForVideo,
  save: saveSegmentsForVideo
};
