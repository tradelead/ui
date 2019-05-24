import OfflineStorage from './OfflineStorage';
import LocalStorageMock from './LocalStorageMock';

let offlineStorage;
beforeEach(() => {
  global.localStorage = new LocalStorageMock();
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

});
