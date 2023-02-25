const { createSuccessResponse, createErrorResponse } = require('../../response.js');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Returns an existing fragment by id
 */
module.exports = async (req, res) => {
  let fragment;

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

  logger.info(
    `Fragment ${req.params.id} found. Sending a response from POST /v1/fragments/:id/info`
  );
  const response = createSuccessResponse({ fragment });
  res.status(200).json(response);
};
