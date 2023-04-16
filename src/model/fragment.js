// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const logger = require('../logger');
var MarkdownIt = require('markdown-it'),
  md = new MarkdownIt();
const sharp = require('sharp');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  // A list of Suppoted types
  static supportedType = [
    `text/plain`,
    `text/markdown`,
    `text/html`,
    `application/json`,
    `image/png`,
    `image/jpeg`,
    `image/webp`,
    `image/gif`,
  ];

  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created;
    this.updated = updated;
    this.type = type;
    this.size = size;
    this.created = new Date() || created;
    this.updated = new Date() || updated;
    if (process.env.AWS_REGION) {
      this.created = JSON.stringify(this.created).replace(/["]+/g, '');
      this.updated = JSON.stringify(this.created).replace(/["]+/g, '');
    }

    if (this.ownerId === undefined) {
      const err = new Error('Fragment is missing ownerId.');
      logger.debug(`${err}, Fragment class error`);
      throw err;
    }

    if (this.type === undefined) {
      const err = new Error('Fragment is missing type.');
      logger.debug(`${err}, Fragment class error`);
      throw err;
    }

    if (this.size < 0) {
      const err = new Error('Fragment size cannot be negative.');
      logger.debug(`${err}, Fragment class error`);
      throw err;
    }

    if (typeof this.size !== 'number') {
      const err = new Error('Fragment size must be a number.');
      logger.debug(`${err}, Fragment class error`);
      throw err;
    }

    if (!Fragment.isSupportedType(this.type)) {
      const err = new Error('Fragment has invalid type.');
      logger.debug(`${err}, Fragment class error`);
      throw err;
    }
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    try {
      return listFragments(ownerId, expand);
    } catch (e) {
      logger.warn('Error with ByUser():', e);
    }
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const result = await readFragment(ownerId, id);

    if (!result) {
      const err = new Error('Fragment cannot be found.');
      logger.debug(`${err}, Fragment class error`);
      throw err;
    }
    logger.debug(`${JSON.stringify(result)}, is returned from byId().`);
    return result;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    this.updated = new Date();
    if (process.env.AWS_REGION) {
      this.updated = JSON.stringify(this.created).replace(/["]+/g, '');
    }
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    logger.debug(`getData() entered - ownerId: ${this.ownerId}, id: ${this.id}`);
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      const err = new Error("Argument to Fragment's setData() is not a buffer.");
      logger.debug(`${err}, Fragment class error`);
      throw err;
    }
    this.size = data.length;
    this.save();
    try {
      return writeFragmentData(this.ownerId, this.id, data);
    } catch (e) {
      logger.warn('Error with byId():', e);
    }
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    let result = contentType.parse(this.type).type;
    return result.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    return Fragment.supportedType;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    if (value.includes('charset')) {
      value = contentType.parse(value).type;
    }
    return Fragment.supportedType.includes(value);
  }

  /**
   * Returns the converted content by type
   * @param {any} content content to be converted; one of supported types
   * @param {string} fromType a Content-Type value
   * @param {string} toType a Content-Type value
   * @returns {any} converted content; one of supported types
   */
  static async convert(content, fromType, toType) {
    logger.debug(`Coonvertion used:`, { content: content, fromType: fromType, toType: toType });
    if (fromType === toType) {
      // do nothing, as type is the same
    } else if (
      (fromType === 'text/plain' || fromType === 'text/markdown' || fromType === 'text/html') &&
      toType === 'text/plain'
    ) {
      // convert any text type to text/plain
      content = content.toString();
    } else if (fromType === 'application/json' && toType === 'text/plain') {
      // convert JSON to text/plain
      content = JSON.stringify(JSON.parse(content)).replace(/["']+/g, '');
    } else if (fromType === 'text/markdown' && toType === 'text/html') {
      // convert markdown to html
      content = md.render(content.toString());
    } else if (
      (fromType === 'image/jpeg' || fromType === 'image/webp' || fromType === 'image/gif') &&
      toType === 'image/png'
    ) {
      // convert an image to image/png
      content = await sharp(content).png().toBuffer();
    } else if (
      (fromType === 'image/png' || fromType === 'image/webp' || fromType === 'image/gif') &&
      toType === 'image/jpeg'
    ) {
      // convert an image to image/jpeg
      content = await sharp(content).jpeg().toBuffer();
    } else if (
      (fromType === 'image/jpeg' || fromType === 'image/png' || fromType === 'image/gif') &&
      toType === 'image/webp'
    ) {
      // convert an image to image/webp
      content = await sharp(content).webp().toBuffer();
    } else if (
      (fromType === 'image/jpeg' || fromType === 'image/webp' || fromType === 'image/png') &&
      toType === 'image/gif'
    ) {
      // convert an image to image/gif
      content = await sharp(content).gif().toBuffer();
    } else {
      const err = new Error('Invalid conversion');
      logger.debug(`${err}, Fragment class error`);
      throw err;
    }

    return content;
  }
}

module.exports.Fragment = Fragment;
