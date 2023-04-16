const { createErrorResponse, createSuccessResponse } = require('../../response.js');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * Returns an existing fragment by id
 */
module.exports = async (req, res) => {
  try {
    // Check if the fragment exists
    await Fragment.byId(req.user, req.params.id);
    // Delete the fragment
    await Fragment.delete(req.user, req.params.id);
  } catch (e) {
    logger.warn(`Fail to find and delete fragment ${req.params.id}, and the error:`, e);
    const response = createErrorResponse(404, `Fail to find and delete fragment ${req.params.id}.`);
    res.status(404).json(response);
    return; // Don't go any further
  }

  logger.info(`Delete fragment ${req.params.id} successfully.`);

  const response = createSuccessResponse();
  res.status(200).json(response);
};
