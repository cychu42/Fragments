const { createSuccessResponse } = require('../../response.js');

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // TODO: this is just a placeholder to get something working...
  const response = createSuccessResponse({
    fragments: [],
  });

  res.status(200).json(response);
};
