const { createErrorResponse } = require('../../response.js');
const { createSuccessResponse } = require('../../response.js');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * Returns an existing fragment by id
 */
module.exports = async (req, res) => {
  let fragment;

  // Get the fragment for update
  try {
    fragment = await Fragment.byId(req.user, req.params.id);
  } catch (e) {
    logger.warn(`The fragment data for ${req.params.id} cannot be found, and the error:`, e);
    const response = createErrorResponse(
      404,
      `The fragment data for ${req.params.id} cannot be found.`
    );
    res.status(404).json(response);
    return; // Don't go any further
  }

  if (req.get('Content-Type') != fragment.type) {
    logger.ingo(`User tries to change fragment data type for ${req.params.id}.`);
    const response = createErrorResponse(
      400,
      "A fragment's type can not be changed after it is created."
    );
    res.status(400).json(response);
    return; // Don't go any further
  }

  // Update fragment and get the new version
  try {
    await fragment.setData(req.body);
  } catch (e) {
    logger.warn('Error with setData() in updat.js:', e);
    const response = createErrorResponse(
      500,
      `Server error when changign the fragment data for ${req.params.id}.`
    );
    res.status(500).json(response);
    return; // Don't go any further
  }

  const response = createSuccessResponse({
    fragment: fragment,
  });

  res.status(200).json(response);
};
