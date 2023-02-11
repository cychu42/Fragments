// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const logger = require('../logger');

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
  static supportedType = ['text/plain'];

  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created;
    this.updated = updated;
    this.type = type;
    this.size = size;
    this.created = new Date();
    this.updated = new Date();

    if (this.ownerId === undefined) {
      const err = new Error('Fragment is missing ownerId.');
      logger.debug(`Fragment class error: ${err}`);
      throw err;
    }

    if (this.type === undefined) {
      const err = new Error('Fragment is missing type.');
      logger.debug(`Fragment class error: ${err}`);
      throw err;
    }

    if (this.size < 0) {
      const err = new Error('Fragment size cannot be negative.');
      logger.debug(`Fragment class error: ${err}`);
      throw err;
    }

    if (typeof this.size != 'number') {
      const err = new Error('Fragment size must be a number.');
      logger.debug(`Fragment class error: ${err}`);
      throw err;
    }

    if (!Fragment.isSupportedType(this.type)) {
      const err = new Error('Fragment has invalid type.');
      logger.debug(`Fragment class error: ${err}`);
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
      return await listFragments(ownerId, expand);
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
      logger.debug(`Fragment class error: ${err}`);
      throw err;
    }
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
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
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
      logger.debug(`Fragment class error: ${err}`);
      throw err;
    }
    this.updated = new Date();
    this.size = data.length;
    try {
      return await writeFragmentData(this.ownerId, this.id, data);
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
}

module.exports.Fragment = Fragment;
