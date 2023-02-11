const { createSuccessResponse } = require('../../response.js');

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  const response = createSuccessResponse({
    fragments: [],
  });

  res.status(200).json(response);
};
