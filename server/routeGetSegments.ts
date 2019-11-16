function routeGetSegments (db, req, res) {
  const platform = req.params.platform;
  const videoID = req.params.videoID;

  if (platform !== 'youtube') {
    res.status(404)
      .json({
        message: 'Unsupported platform \'' + platform + '\'.'
      });
  }

  // Return dummy data (TODO)
  db.query(videoID)
    .then(segments => {
      if (!segments || segments.length === 0) {
        res.status(404)
          .json({
            message: 'No sponsors found.',
            segments: []
          });
      } else {
        res.json({
          segments: Object.values(segments)
        });
      }
    })
    .catch(e => console.log(e));
}

module.exports = routeGetSegments;
