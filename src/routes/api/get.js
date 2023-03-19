const { createSuccessResponse, createErrorResponse } = require('../../response.js');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger.js');
/**
 * Get a list of fragment ids for the current user
 * If expand=1, show entire metadata
 */
module.exports = async (req, res) => {
  let fullInfo = false;
  let response, result;
  if (req.query.expand == 1) {
    fullInfo = true;
  }
  logger.debug('Expand is ', fullInfo);

  try {
    result = await Fragment.byUser(req.user, fullInfo);
    response = createSuccessResponse({
      fragments: result,
    });
  } catch (e) {
    logger.warn('Error with byUser() and creating a response for GET /v1/fragments:', e);
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
    return;
  }

  logger.info('Sending a response from GET /v1/fragments, the result is: ', result);

  res.status(200).json(response);
};
