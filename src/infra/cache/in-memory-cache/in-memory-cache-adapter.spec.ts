import { InMemoryCacheAdapter } from './in-memory-cache.adapter';

describe('InMemoryCacheAdapter', () => {
  let sut: InMemoryCacheAdapter;

  beforeEach(() => {
    sut = new InMemoryCacheAdapter();
  });

  describe('get()', () => {
    it('should get an existing key', async () => {
      sut.set('key', 'value');

      const value = await sut.get('key');

      expect(value).toBe('value');
    });

    it('should return null if key does not exist', async () => {
      const value = await sut.get('key');

      expect(value).toBeUndefined();
    });
  });
  describe('set()', () => {
    it('should set a key value', async () => {
      await sut.set('key', 'value');

      const value = await sut.get('key');

      expect(value).toBe('value');
    });

    it('should overwrite a key value', async () => {
      await sut.set('key', 'value');
      await sut.set('key', 'new value');

      const value = await sut.get('key');

      expect(value).toBe('new value');
    });
  });

  describe('del()', () => {
    it('should delete a key', async () => {
      await sut.set('key', 'value');
      await sut.del('key');

      const value = await sut.get('key');

      expect(value).toBeUndefined();
    });
  });
});
