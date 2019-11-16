function routePostSegments (db, req, res) {
  const data = req.body;
  const accepted = recordSegments(db, data);

  if (accepted) {
    res.json({
      message: 'received'
    });
  } else {
    res.status(400)
      .json({
        message: 'declined'
      });
  }
}

function recordSegments (db, data) {
  const platform = data.platform;
  const videoID = data.videoID;
  const segments = data.segments;
  const userID = data.userID;

  // TODO: proper validation of segments
  if (platform !== 'youtube' || typeof videoID !== 'string' || !segments || !userID) {
    return false;
  }

  // TODO: record userID
  db[platform][videoID].push(segments);
  return true;
}

module.exports = routePostSegments;
