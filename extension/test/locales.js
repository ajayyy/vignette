'use strict';

const fs = require('fs');

function inFirstButNotInSecond (first, second) {
  return first.filter(el => second.indexOf(el) < 0);
}

/*
 * Finds all missing or redundant messages, using "en" locale
 * as the reference.
 */
function coverage (defaultLocale = 'en') {
  let ok = true;
  const reference = require('./../_locales/en/messages.json');
  const needed = Object.keys(reference);
  fs.readdir('./extension/_locales/', (err, locales) => {
    if (err) {
      console.error('Error reading files');
    }
    for (const locale of locales) {
      if (locale === 'en') {
        continue;
      }
      const localeFile = require('./../_locales/' + locale + '/messages.json');
      const localeKeys = Object.keys(localeFile);
      const missing = inFirstButNotInSecond(needed, localeKeys);
      const redundant = inFirstButNotInSecond(localeKeys, needed);
      if (missing.length || redundant.length) {
        ok = false;
        console.info('Locale ' + locale + ':\n' +
          (missing.length ? ('  missing: ' + missing + '\n') : '') +
          (redundant.length ? ('  redundant: ' + redundant + '\n') : ''));
      }
    }
  });
  return ok;
}

coverage();

module.exports = coverage;
