const { createSuccessResponse } = require('../../response.js');
const { createErrorResponse } = require('../../response.js');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Create a fragment, save it and the data, and show it to the user
 */
module.exports = async (req, res) => {
  if (Buffer.isBuffer(req.body)) {
    const newFrag = new Fragment({
      ownerId: req.user,
      type: req.get('Content-Type'),
      size: 0,
    });
    try {
      await newFrag.save();
      await newFrag.setData(req.body);
    } catch (e) {
      logger.warn('Error with byId():', e);
    }
    // Setting Location header
    const apiUrl = new URL(
      `/v1/fragments/${newFrag.id}`,
      `http://${process.env.API_URL || req.headers.host}`
    );
    res.setHeader('Location', apiUrl);

    logger.debug({ id: newFrag.id, host: req.headers.host, apiUrl }, 'Fragment created');

    const response = createSuccessResponse({
      fragment: newFrag,
    });
    logger.info(`Content-Type is supported; sending a response from POST /v1/fragments`);
    res.status(201).json(response);
  } else {
    logger.info(`Content-Type is not supported.`);
    const response = createErrorResponse(415, 'Content-Type is not supported.');
    res.status(415).json(response);
  }
};
