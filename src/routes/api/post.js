const { createSuccessResponse } = require('../../response.js');
const { createErrorResponse } = require('../../response.js');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Create a fragment, save it and the data, and show it to the user
 */
module.exports = async (req, res) => {
  let content;
  if (Buffer.isBuffer(req.body)) {
    const newFrag = new Fragment({
      ownerId: req.user,
      type: req.get('Content-Type'),
      size: 0,
    });
    try {
      await newFrag.save();
      await newFrag.setData(req.body);
      content = await Fragment.byId(req.user, newFrag.id);
    } catch (e) {
      logger.warn('Error with byId():', e);
    }
    // Setting Location header
    const apiUrl = new URL(
      `/v1/fragments/${newFrag.id}`,
      `https://${process.env.API_URL || req.headers.host}`
    );
    res.setHeader('Location', apiUrl);

    logger.debug(`id of the fragment is ${newFrag.id}`);
    logger.debug(`req.headers.host is ${req.headers.host}`);
    logger.debug(`apiUrl is ${apiUrl}`);

    const response = createSuccessResponse({
      fragment: content,
    });
    logger.info(`Content-Type is supported; sending a response from POST /v1/fragments`);
    res.status(201).json(response);
  } else {
    logger.info(`Content-Type is not supported.`);
    const response = createErrorResponse(415, 'Content-Type is not supported.');
    res.status(415).json(response);
  }
};
