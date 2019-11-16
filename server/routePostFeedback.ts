function routePostFeedback (req, res) {
  res.status(400)
    .json({
      message: 'declined'
    });
}

module.exports = routePostFeedback;
