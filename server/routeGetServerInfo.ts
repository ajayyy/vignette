/*
 * Returns the information about the server
 * including:
 *    - apiVersions: an array of strings identifying
 *      supported API versions
 *    - ...
 */
function routeGetServerInfo (req, res) {
  res.json({
    apiVersions: {
      version: 'v0',
      status: 'official'
    }
  });
}

module.exports = routeGetServerInfo;
