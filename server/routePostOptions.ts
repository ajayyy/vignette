function routePostOptions (db, req, res) {
  console.log(req);
  res.status(400)
    .json({
      message: 'declined'
    });
}

module.exports = routePostOptions;
