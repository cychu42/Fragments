const { createSuccessResponse } = require('../../response.js');
const { createErrorResponse } = require('../../response.js');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const path = require('path');
/**
 * Returns an existing fragment by id
 */
module.exports = async (req, res) => {
  let fragment, content;

  try {
    fragment = await Fragment.byId(req.user, path.parse(req.params.id).name);
    content = await fragment.getData();
  } catch (e) {
    logger.warn(`The fragment data for ${req.params.id} cannot be found, and the error:`, e);
    const response = createErrorResponse(
      404,
      `The fragment data for ${req.params.id} cannot be found.`
    );
    res.status(404).json(response);
    return; // Don't go any further
  }

  // If :id route specifies a type at the end...
  if (req.params.id.includes('.')) {
    //change the content-type header for text/plain
    if (req.params.id.endsWith('.txt')) {
      res.setHeader('Content-Type', 'text/plain');
      logger.info(
        'text/plain Content-Type is supported; sending a response from GET /fragments/:id'
      );

      res.status(200).send(content.toString());
    } else {
      // unsupported Content-Type
      let msg = 'Content-Type is not supported; sending an error from POST /v1/fragments';
      logger.info(msg);
      const response = createErrorResponse(415, msg);
      res.status(415).json(response);
    }
  } else {
    // no Content-Type specified, so send as it is
    logger.info(`No Content-Type specified; sending a response from POST /v1/fragments`);
    res.setHeader('Content-Type', fragment.type);
    res.status(200).send(content);
  }
};
