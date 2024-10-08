const express = require('express');
const os = require('os');

// version and author from package.json
const { version, author } = require('../../package.json');
const { createSuccessResponse } = require('../response.js');
// Our authentication middleware (index.js will decide which type of authentication to use)
const { authenticate } = require('../authorization/index');

// Create a router that we can use to mount our API
const router = express.Router();

/**
 * Expose all of our API routes on /v1/* to include an API version.
 * Protect them all so you have to be authenticated in order to access.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');

  // Send a 200 'OK' response
  const response = createSuccessResponse({
    author,
    githubUrl: 'https://github.com/cychu42/Fragments',
    version,
    hostname: os.hostname(),
  });

  res.status(200).json({
    status: 'ok',
    ...response,
  });
});

module.exports = router;
