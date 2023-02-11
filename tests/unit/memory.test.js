const dbLogic = require('../../src/model/data/memory/index');

describe('memory-db-logic', () => {
  test('writeFragment() returns nothing', async () => {
    const fragment = { ownerId: 'a', id: 'b' };
    const result = await dbLogic.writeFragment(fragment);
    expect(result).toBe(undefined);
  });

  test('readFragment() returns what writeFragment() put into the db', async () => {
    const fragment = { ownerId: 'a', id: 'b' };
    await dbLogic.writeFragment(fragment);
    const result = dbLogic.readFragment(fragment.ownerId, fragment.id);
    expect(result).resolves.toBe(fragment);
  });

  test('readFragment() with incorrect secondary key returns nothing', async () => {
    const fragment = { ownerId: 'a', id: 'b' };
    await dbLogic.writeFragment(fragment);
    const result = dbLogic.readFragment(fragment.ownerId, 'c');
    expect(result).resolves.toBe(undefined);
  });

  test('writeFragmentData() returns nothing', async () => {
    const data = Buffer.from([1, 2, 3]);
    const result = await dbLogic.writeFragmentData('a', 'b', data);
    expect(result).toBe(undefined);
  });

  test('readFragmentData() returns what writeFragmentData() put into the db', async () => {
    const data = Buffer.from([1, 2, 3]);
    await dbLogic.writeFragmentData('a', 'b', data);
    const result = dbLogic.readFragmentData('a', 'b');
    expect(result).resolves.toBe(data);
  });

  test('readFragmentData() with incorrect secondary key returns nothing', async () => {
    const data = Buffer.from([1, 2, 3]);
    await dbLogic.writeFragmentData('a', 'b', data);
    const result = dbLogic.readFragmentData('a', 'c');
    expect(result).resolves.toBe(undefined);
  });

  test('readFragment() expects string keys', () => {
    expect(async () => await dbLogic.readFragment()).rejects.toThrow();
    expect(async () => await dbLogic.readFragment(1)).rejects.toThrow();
    expect(async () => await dbLogic.readFragment(1, 1)).rejects.toThrow();
  });

  test('writeFragment() expects string keys', () => {
    expect(async () => await dbLogic.writeFragment()).rejects.toThrow();
    expect(async () => await dbLogic.writeFragment(1)).rejects.toThrow();
    expect(async () => await dbLogic.writeFragment(1, 1)).rejects.toThrow();
  });

  test('readFragmentData() expects string keys', () => {
    expect(async () => await dbLogic.readFragmentData()).rejects.toThrow();
    expect(async () => await dbLogic.readFragmentData(1)).rejects.toThrow();
    expect(async () => await dbLogic.readFragmentData(1, 1)).rejects.toThrow();
  });

  test('writeFragment() expects string keys', () => {
    expect(async () => await dbLogic.writeFragmentData()).rejects.toThrow();
    expect(async () => await dbLogic.writeFragmentData(1)).rejects.toThrow();
    expect(async () => await dbLogic.writeFragmentData(1, 1, 1)).rejects.toThrow();
  });
});
