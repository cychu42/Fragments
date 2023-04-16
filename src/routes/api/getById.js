const { createErrorResponse } = require('../../response.js');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const path = require('path');
const { readFragmentData } = require('../../model/data/aws/index.js');

/**
 * Returns an existing fragment by id
 */

// Handle response to unsupported conversion
function unsupportedConversion(res) {
  // unsupported Content-Type
  logger.info('Unable to convert.');
  const response = createErrorResponse(415, 'Unable to convert. Please use right content type.');
  res.status(415).json(response);
}

module.exports = async (req, res) => {
  let fragment, content;
  let ext = path.parse(req.params.id).ext;
  try {
    fragment = await Fragment.byId(req.user, path.parse(req.params.id).name);

    // Given return object differs between in-memory and AWS services, change implementation slightly
    if (process.env.AWS_REGION) {
      content = await readFragmentData(fragment.ownerId, fragment.id);
    } else {
      content = await fragment.getData();
    }
  } catch (e) {
    logger.warn(`The fragment data for ${req.params.id} cannot be found, and the error:`, e);
    const response = createErrorResponse(
      404,
      `The fragment data for ${req.params.id} cannot be found.`
    );
    res.status(404).json(response);
    return; // Don't go any further
  }

  // No Content-Type specified, so send as it is
  if (!req.params.id.includes('.')) {
    logger.info(`No Content-Type specified; sending a response from GET /v1/fragments/:id`);
    res.setHeader('Content-Type', fragment.type);
    res.status(200).send(content);
    return; // Don't go any further
  }

  //set type
  if (ext === '.txt') {
    ext = 'text/plain';
  } else if (ext === '.md') {
    ext = 'text/markdown';
  } else if (ext === '.html') {
    ext = 'text/html';
  } else if (ext === '.json') {
    ext = 'application/json';
  } else if (ext === '.png') {
    ext = 'image/png';
  } else if (ext === '.jpg') {
    ext = 'image/jpeg';
  } else if (ext === '.webp') {
    ext = 'image/webp';
  } else if (ext === '.gif') {
    ext = 'image/gif';
  } else {
    // Not a supported type
    unsupportedConversion(res);
    return;
  }

  try {
    res.setHeader('Content-Type', ext);
    content = await Fragment.convert(content, fragment.type, ext);
    logger.info(`${ext} Content-Type is supported; sending a response from GET /v1/fragments/:id`);
    res.status(200).send(content);
  } catch (e) {
    // Invalid conversion
    unsupportedConversion(res);
  }
};
