import sinon from 'sinon';
import Trader from './Trader';

let mockTrader;

beforeEach(() => {
  mockTrader = new Trader({
    id: 'test123',
    roles: ['test1', 'test2'],
    accountService: {
      getUserData: sinon.stub(),
      updateUser: sinon.stub(),
      addExchangeKey: sinon.stub(),
      deleteExchangeKey: sinon.stub(),
      signUpload: sinon.stub(),
    },
    traderScoreService: { getTraderData: sinon.stub() },
  });
});

describe('fieldKey', () => {
  it('returns if string', () => {
    expect(Trader.fieldKey('bio')).toEqual('bio');
  });

  it('returns key if object', () => {
    expect(Trader.fieldKey({ key: 'bio' })).toEqual('bio');
  });
});

describe('ttl', () => {
  const verifyTTL = (field, expectedTTL) => {
    const ttl = mockTrader.ttl(field);
    expect(ttl).toEqual(expectedTTL);
  };

  test('bio ttl is 2 hours', async () => {
    verifyTTL('bio', 2 * 60 * 60 * 1000);
  });

  test('website ttl is 2 hours', async () => {
    verifyTTL('website', 2 * 60 * 60 * 1000);
  });

  test('exchangeKeys ttl is 30 seconds', async () => {
    verifyTTL('exchangeKeys', 30 * 1000);
  });

  test('score ttl is 60 seconds', async () => {
    verifyTTL('score', 60 * 1000);
  });

  test('rank ttl is 60 seconds', async () => {
    verifyTTL('rank', 60 * 1000);
  });

  test('scores ttl is 60 seconds', async () => {
    verifyTTL('scores', 60 * 1000);
  });
});

describe('fetch', () => {
  const verifyFetchRsp = async (field, expectedRsp) => {
    const rsp = await mockTrader.fetch(field);
    expect(rsp).toEqual(expectedRsp);
  };

  it('returns bio from accountService', async () => {
    const field = 'bio';
    const bio = 'this is my bio';

    mockTrader.accountService.getUserData
      .withArgs(mockTrader.id, [field])
      .resolves({ bio });

    await verifyFetchRsp(field, bio);
  }, 100);

  it('returns website from accountService', async () => {
    const field = 'website';
    const website = 'http://test.com/test';

    mockTrader.accountService.getUserData
      .withArgs(mockTrader.id, [field])
      .resolves({ website });

    await verifyFetchRsp(field, website);
  }, 100);

  it('returns exchangeKeys from accountService', async () => {
    const field = 'exchangeKeys';
    const exchangeKeys = [{ test: 1 }, { test: 2 }];

    mockTrader.accountService.getUserData
      .withArgs(mockTrader.id, [field])
      .resolves({ exchangeKeys });

    await verifyFetchRsp(field, exchangeKeys);
  });

  it('returns score from traderScoreService', async () => {
    const field = 'score';
    const score = 123;

    mockTrader.traderScoreService.getTraderData
      .withArgs(mockTrader.id, [field])
      .resolves({ score });

    await verifyFetchRsp(field, score);
  });

  it('returns rank from traderScoreService', async () => {
    const field = 'rank';
    const rank = 123;

    mockTrader.traderScoreService.getTraderData
      .withArgs(mockTrader.id, [field])
      .resolves({ rank });

    await verifyFetchRsp(field, rank);
  });

  it('returns scores from traderScoreService', async () => {
    const field = {
      key: 'scores',
      period: 'day',
      duration: 24 * 60 * 60 * 1000,
    };
    const scores = [123];

    mockTrader.traderScoreService.getTraderData
      .withArgs(mockTrader.id, [field])
      .resolves({ scores });

    await verifyFetchRsp(field, scores);
  });
});

describe('upload', () => {

});

describe('update', () => {
  it('calls accountService.updateUser', async () => {
    const obj = [{ bio: 'test' }];
    await mockTrader.update(obj);
    sinon.assert.calledWith(mockTrader.accountService.updateUser, obj);
  });

  it('returns rsp from accountService.updateUser', async () => {
    const expectedRes = {};
    mockTrader.accountService.updateUser.resolves(expectedRes);
    const updateUser = await mockTrader.update();
    expect(updateUser).toBe(expectedRes);
  });

  it('throws error from accountService.updateUser', async () => {
    const expectedErr = new Error('test');
    mockTrader.accountService.updateUser.rejects(expectedErr);

    let err = null;
    try {
      await mockTrader.update();
    } catch (e) {
      err = e;
    }
    expect(err).toBe(expectedErr);
  });
});

describe('addExchangeKey', () => {
  it('calls accountService.addExchangeKey', async () => {
    const obj = [{ bio: 'test' }];
    await mockTrader.addExchangeKey(obj);
    sinon.assert.calledWith(mockTrader.accountService.addExchangeKey, obj);
  });

  it('returns rsp from accountService.addExchangeKey', async () => {
    const expectedRes = {};
    mockTrader.accountService.addExchangeKey.resolves(expectedRes);
    const updateUser = await mockTrader.addExchangeKey();
    expect(updateUser).toBe(expectedRes);
  });

  it('throws error from accountService.addExchangeKey', async () => {
    const expectedErr = new Error('test');
    mockTrader.accountService.addExchangeKey.rejects(expectedErr);

    let err = null;
    try {
      await mockTrader.addExchangeKey();
    } catch (e) {
      err = e;
    }
    expect(err).toBe(expectedErr);
  });
});

describe('deleteExchangeKey', () => {
  it('calls accountService.deleteExchangeKey', async () => {
    const obj = [{ bio: 'test' }];
    await mockTrader.deleteExchangeKey(obj);
    sinon.assert.calledWith(mockTrader.accountService.deleteExchangeKey, obj);
  });

  it('returns rsp from accountService.deleteExchangeKey', async () => {
    const expectedRes = {};
    mockTrader.accountService.deleteExchangeKey.resolves(expectedRes);
    const updateUser = await mockTrader.deleteExchangeKey();
    expect(updateUser).toBe(expectedRes);
  });

  it('throws error from accountService.deleteExchangeKey', async () => {
    const expectedErr = new Error('test');
    mockTrader.accountService.deleteExchangeKey.rejects(expectedErr);

    let err = null;
    try {
      await mockTrader.deleteExchangeKey();
    } catch (e) {
      err = e;
    }
    expect(err).toBe(expectedErr);
  });
});
