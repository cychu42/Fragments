const { createErrorResponse } = require('../../response.js');
const { createSuccessResponse } = require('../../response.js');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * Returns an existing fragment by id
 */
module.exports = async (req, res) => {
  let fragment;

  // Get the fragment metadata for update
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

  // Check if user tries to change data type
  if (req.get('Content-Type') != fragment.type) {
    logger.info(`User tries to change fragment data type for ${req.params.id}.`);
    const response = createErrorResponse(
      400,
      "A fragment's type can not be changed after it is created."
    );
    res.status(400).json(response);
    return; // Don't go any further
  }

  // Make a fragment with retrieved fragment data to update fragment
  const updateFrag = new Fragment({
    id: fragment.id,
    ownerId: fragment.ownerId,
    created: fragment.created,
    updated: fragment.updated,
    type: fragment.type,
    size: 0,
  });

  try {
    await updateFrag.setData(req.body);
  } catch (e) {
    logger.warn('Error with setData() in updat.js:', e);
    const response = createErrorResponse(
      500,
      `Server error when changing the fragment data for ${req.params.id}, and update data is ${req.body}`
    );
    res.status(500).json(response);
    return; // Don't go any further
  }

  // Get the new version of the fragment
  fragment = await Fragment.byId(req.user, req.params.id);

  const response = createSuccessResponse({
    fragment: fragment,
  });

  res.status(200).json(response);
};
