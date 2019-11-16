const express = require('express');

const options = require('./options.json');

const db = require('./database.ts');

const validateSchema = require('./schemas/validateSchema.ts');

const validateSignature = require('./crypto.ts').validateExpress;

// Server options
// Port
const port = options.port || 3000;

const routeGetServerInfo = require('./routeGetServerInfo.ts');
const routeGetSegments = require('./routeGetSegments.ts');
const routePostSegments = require('./routePostSegments.ts');
const routePostOptions = require('./routePostOptions.ts');
const routePostFeedback = require('./routePostFeedback.ts');

/*
 * Wrap in async function to use Promisses with await.
 */
async function main () {
  await db.open();

  const app = express();
  // Set server to 'production'
  app.set('env', 'production');
  app.disable('x-powered-by');

  /*
   * CORS policy
   */
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.use(express.json());

  app.get('/', (req, res) => res.json({ message: 'Hello World!' }));

  app.get('/info', routeGetServerInfo);

  app.get('/v0/segments/:platform/:videoID',
    (req, res) => routeGetSegments(db, req, res));

  app.post('/v0/segments', validateSignature, validateSchema,
    (req, res) => routePostSegments(db, req, res));

  app.post('/v0/options', validateSignature, validateSchema,
    (req, res) => routePostOptions(db, req, res));

  app.post('/v0/feedback', validateSignature, validateSchema,
    (req, res) => routePostFeedback(db, req, res));

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}

main()
  .then(() => console.log('Server ready.'));
