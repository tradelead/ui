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
  });

  traderService.offlineStorage = { fetch: sinon.stub() };
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
  beforeEach(() => {
    traderService.offlineObservable.observe = sinon.stub();
  });

  it('calls observe with topTrader field', async () => {
    traderService.observeTopTraders({ period: 'day', limit: 10 });
    sinon.assert.calledWith(
      traderService.offlineObservable.observe,
      [{ key: 'topTraders', period: 'day', limit: 10 }],
      sinon.match.any,
    );
  });
});

describe('fetch', () => {
  test('topTrader field calls traderScoreService.getTopTraders', async () => {
    await traderService.fetch({ key: 'topTraders', period: 'day', limit: 10 });
    sinon.assert.calledWith(
      traderService.traderScoreService.getTopTraders,
      { period: 'day', limit: 10 },
    );
  });
});

describe('fieldKey', () => {
  it('returns key property from object', () => {
    expect(traderService.fieldKey({ key: 'topTraders' })).toEqual('topTraders');
  });
});

describe('ttl', () => {
  test('topTrader ttl is 15 seconds', () => {
    expect(traderService.ttl({ key: 'topTraders' })).toEqual(15000);
  });
});
