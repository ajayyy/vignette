/*
 * sqlite3 has terrible promisses
 * Need to use something else.
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const fs = require('fs');

const sqlite3 = require('sqlite3').verbose();

const fetch = require('node-fetch');

const base = 'https://sponsor.ajay.app/api/';

const cacheTTL = 60 * 10;

const cache = {};

const RAMdb = {};

async function querySegmentsForVideo (videoID) {
  const time = Date.now();
  let cached = cache[videoID];
  // No recent enough cache record
  if (!cached || cached.timestamp <= time - cacheTTL) {
    const url = base + 'getVideoSponsorTimes?videoID=' + videoID;
    const data = await fetch(url);
    if (data.status !== 200) {
      return null;
    }
    const json = await data.json();
    const formatted = {};
    console.log(JSON.stringify(json));
    for (let i = 0; i < json.UUIDs.length; i++) {
      console.log(JSON.stringify(json.sponsorTimes[i]));
      formatted[json.UUIDs[i]] = {
        startTime: json.sponsorTimes[i][0],
        endTime: json.sponsorTimes[i][1],
        type: 'sponsor'
      };
    }
    cached = {
      timestamp: time,
      data: formatted
    };
    cache[videoID] = cached;
  }
  console.log(JSON.stringify(cached.data));
  return cached.data;
}

async function submitSegmentsForVideo (data) {

}

async function importFromSponsorBlock (file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      console.info('No SponsorBlock database file specified for import.');
      resolve();
      return;
    }

    if (!fs.existsSync(file)) {
      const message = `SponsorBlock database file is specified, but is missing: ${file}.`;
      reject(new Error(message));
      return;
    }

    console.info(`Importing SponsorBlock database from ${file}...`);

    const source = new sqlite3.Database(file);
    source.each('SELECT UUID, videoID, startTime, endTime, userID, timeSubmitted, views FROM `sponsorTimes` WHERE shadowHidden = 0', [], (err, row) => {
      if (err) {
        console.log('importFromSponsorBlock error reading row', err);
      }

      const videoID = row.videoID; ;
      const segmentID = `SponsorBlock-${row.UUID}`;

      if (!RAMdb[videoID]) {
        RAMdb[videoID] = {};
      }
      RAMdb[videoID][segmentID] = {
        videoID: row.videoID,
        segmentID: segmentID,
        reporter: `SponsorBlock-${row.userID}`,
        type: 'sponsor',
        startTime: row.startTime,
        endTime: row.endTime,
        views: row.views || 0,
        timestamp: row.timeSubmitted
      };
    });
    setTimeout(() => {
      source.close();
      console.info('Impoted SponsorBlock database.');
      resolve();
    },
    2000);
  });
}

module.exports = {
  querySegmentsForVideo: querySegmentsForVideo,
  submitSegmentsForVideo: submitSegmentsForVideo,
  importFromSponsorBlock: importFromSponsorBlock
};
