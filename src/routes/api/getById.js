const { createErrorResponse } = require('../../response.js');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const path = require('path');
const { readFragmentData } = require('../../model/data/aws/index.js');

/**
 * Returns an existing fragment by id
 */
module.exports = async (req, res) => {
  let fragment, content;
  const ext = path.parse(req.params.id).ext;
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

  // If :id route specifies a type at the end, then do conversion

  if (ext === '.txt') {
    //change the content-type header for text/plain
    res.setHeader('Content-Type', 'text/plain');
    logger.info(
      'text/plain Content-Type is supported; sending a response from GET /v1/fragments/:id'
    );

    // Convert content to text/plain
    content = Fragment.convert(content, 'text/*', 'text/plain');

    res.status(200).send(content);
  } else if (ext === '.html') {
    //change the content-type header for text/plain
    res.setHeader('Content-Type', 'text/html');

    // convert markdown to html
    if (fragment.type === 'text/markdown') {
      content = Fragment.convert(content, 'text/markdown', 'text/html');
    }

    logger.info(
      'text/html Content-Type is supported; sending a response from GET /v1/fragments/:id'
    );

    res.status(200).send(content);
  } else if (req.params.id.includes('.')) {
    // unsupported Content-Type
    logger.info('Unsupported Content-Type');
    const response = createErrorResponse(415, 'Unsupported Content-Type');
    res.status(415).json(response);
  }

  // no Content-Type specified, so send as it is
  if (!req.params.id.includes('.')) {
    logger.info(`No Content-Type specified; sending a response from GET /v1/fragments/:id`);
    res.setHeader('Content-Type', fragment.type);
    res.status(200).send(content);
  }
};
