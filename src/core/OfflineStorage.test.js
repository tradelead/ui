import OfflineStorage from './OfflineStorage';
import LocalStorageMock from './LocalStorageMock';

let offlineStorage;
beforeEach(() => {
  global.localStorage = new LocalStorageMock();
  global.localStorage.clear();
  offlineStorage = new OfflineStorage();
});

test('get and update work', async () => {
  await offlineStorage.update('test', { test: 1 });
  const { data, time } = await offlineStorage.get('test');
  expect(data).toEqual({ test: 1 });
  expect(time).toBeGreaterThan(Date.now() - 10);
  expect(time).toBeLessThan(Date.now());
});

describe('fetch', () => {
  it('calls fetch when cached data undefined', async () => {
    const [cached, updated] = await offlineStorage.fetch('test', 1000, async () => 'test-fetch-data');
    expect(cached).toBeUndefined();
    expect(await updated).toEqual('test-fetch-data');
  });

  it('updates cached data with fetch data and current time', async () => {
    // eslint-disable-next-line no-unused-vars
    const [cached, updated] = await offlineStorage.fetch('test', 1000, async () => 'test-fetch-data');
    await updated;
    const { data, time } = await offlineStorage.get('test');
    expect(data).toEqual('test-fetch-data');
    expect(time).toBeGreaterThan(Date.now() - 10);
    expect(time).toBeLessThan(Date.now());
  });

  describe('not expired', () => {
    it('returns cached data', async () => {
      await offlineStorage.update('test', { test: 1 });
      const [cached] = await offlineStorage.fetch('test', 1000, async () => 'test-fetch-data');
      expect(cached).toEqual({ test: 1 });
    });

    it('does not fetch', async () => {
      await offlineStorage.update('test', { test: 1 });
      // eslint-disable-next-line no-unused-vars
      const [cached, updated] = await offlineStorage.fetch('test', 1000, async () => 'test-fetch-data');
      expect(updated == null).toBeTruthy();
    });
  });

  describe('expired', () => {
    it('returns cached data', async () => {
      const { now } = Date;
      Date.now = () => 1000;

      await offlineStorage.update('test', { test: 1 });
      Date.now = () => 2001;

      // eslint-disable-next-line no-unused-vars
      const [cached, updated] = await offlineStorage.fetch('test', 1000, async () => 'test-fetch-data');
      expect(cached).toEqual({ test: 1 });

      Date.now = now;
    });

    it('calls fetch', async () => {
      const { now } = Date;
      Date.now = () => 1000;

      await offlineStorage.update('test', { test: 1 });
      Date.now = () => 2001;

      // eslint-disable-next-line no-unused-vars
      const [cached, updated] = await offlineStorage.fetch('test', 1000, async () => 'test-fetch-data');
      expect(await updated).toEqual('test-fetch-data');

      Date.now = now;
    });
  });
});
