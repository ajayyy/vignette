'use strict';

const Ajv = require('ajv');

const ajv = new Ajv({ jsonPointers: true, allErrors: true });

const schemaSegments = require('./segments.json');
const schemaOptions = require('./options.json');
const schemaFeedback = require('./feedback.json');

/*
 * Mapping between request URL path and the JSON schema.
 */
const schemaMap = {
  '/v0/segments': schemaSegments,
  '/v0/options': schemaOptions,
  '/v0/feedback': schemaFeedback
};

function testSchema (req, res, next) {
  const pathname = req._parsedUrl.pathname.replace(/\/+$/, '');
  const data = req.body;
  const schema = schemaMap[pathname];

  const valid = ajv.validate(schema, data);

  if (valid) {
    next();
  } else {
    const errors = [];
    ajv.errors.forEach(e => errors.push(e.message));
    const message = `Invalid request body: ${errors.join('; ')}.`;
    res.status(400)
      .json({
        message: message
      });
  }
}

module.exports = testSchema;
