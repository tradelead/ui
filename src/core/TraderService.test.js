import sinon from 'sinon';
import TraderService from './TraderService';

let traderService;

beforeEach(() => {
  traderService = new TraderService({
    accountService: {
      getUser: sinon.stub(),
    },
    traderScoreService: {
      getTopTraders: sinon.stub(),
    },
    offlineStorage: {
      fetch: sinon.stub(),
    },
  });

  traderService.offlineStorage.fetch.callsFake((key, ttl, fetch) => (async () => [
    null,
    (async () => fetch())(),
  ])());
});

describe('getTrader', () => {
  it('calls accountService.getUser', async () => {
    const obj = [{ bio: 'test' }];
    await traderService.getTrader(obj);
    sinon.assert.calledWith(traderService.accountService.getUser, obj);
  });

  it('returns rsp from accountService.getUser', async () => {
    const expectedRes = {};
    traderService.accountService.getUser.resolves(expectedRes);
    const res = await traderService.getTrader();
    expect(res).toBe(expectedRes);
  });

  it('returns offline data if not expired', async () => {
    const offlineData = { test: 1 };
    traderService.offlineStorage.fetch.callsFake(() => (async () => [
      offlineData,
      null,
    ])());
    const res = await traderService.getTrader();
    expect(res).toBe(offlineData);
  });

  it('returns offline data if fetch throws error', async () => {
    const offlineData = { test: 1 };
    traderService.offlineStorage.fetch.callsFake(() => (async () => [
      offlineData,
      (async () => { throw new Error('Network Error'); })(),
    ])());
    const res = await traderService.getTrader();
    expect(res).toBe(offlineData);
  });
});

describe('observeTopTraders', () => {
  it('fetches from traderScoreService.getTopTraders', async () => {

  });

  it('has ttl of 30 seconds', async () => {

  });
});
