import sinon from 'sinon';
import isEqual from 'lodash.isequal';
import Trader from './Trader';
import MockFile from '../components/AccountSettings/ProfileSettings/MockFile';

const clock = sinon.useFakeTimers();

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
    offlineFetcher: { fetch: sinon.stub() },
  });

  mockTrader.offlineFetcher.fetch.callsFake((key, ttl, fetch) => (async () => [
    null,
    (async () => fetch())(),
  ])());
});

describe('observe', () => {
  const awaitObserveRsp = (args, expectRsp) => new Promise(async (resolve) => {
    const compare = (value, expected) => {
      if (typeof expected === 'function') {
        return expected(value);
      }

      return isEqual(value, expected);
    };

    const dispose = mockTrader.observe(args, (...rsp) => {
      const dataValid = compare(rsp[0], expectRsp[0]);
      const loadingValid = compare(rsp[1], expectRsp[1]);
      const errorValid = compare(rsp[2], expectRsp[2]);

      if (dataValid && loadingValid && errorValid) {
        resolve(true);
        dispose();
      }
    });
  });

  describe('verify field source', () => {
    it('returns bio from accountService', async () => {
      const bio = 'this is my bio';

      mockTrader.accountService.getUserData
        .withArgs(mockTrader.id, ['bio'])
        .resolves({ bio });

      const expectRsp = [{ bio }, false, undefined];
      await awaitObserveRsp(['bio'], expectRsp);
    }, 100);

    it('returns website from accountService', async () => {
      const website = 'http://test.com/test';

      mockTrader.accountService.getUserData
        .withArgs(mockTrader.id, ['website'])
        .resolves({ website });

      const expectRsp = [{ website }, false, undefined];
      await awaitObserveRsp(['website'], expectRsp);
    }, 100);

    it('returns exchangeKeys from accountService', async () => {
      const exchangeKeys = [{ test: 1 }, { test: 2 }];

      mockTrader.accountService.getUserData
        .withArgs(mockTrader.id, ['exchangeKeys'])
        .resolves({ exchangeKeys });

      const expectRsp = [{ exchangeKeys }, false, undefined];
      await awaitObserveRsp(['exchangeKeys'], expectRsp);
    });

    it('returns score from traderScoreService', async () => {
      const score = 123;

      mockTrader.traderScoreService.getTraderData
        .withArgs(mockTrader.id, ['score'])
        .resolves({ score });

      const expectRsp = [{ score }, false, undefined];
      await awaitObserveRsp(['score'], expectRsp);
    });

    it('returns rank from traderScoreService', async () => {
      const rank = 123;

      mockTrader.traderScoreService.getTraderData
        .withArgs(mockTrader.id, ['rank'])
        .resolves({ rank });

      const expectRsp = [{ rank }, false, undefined];
      await awaitObserveRsp(['rank'], expectRsp);
    });

    it('returns scores from traderScoreService', async () => {
      const scores = 123;
      const args = [{
        key: 'scores',
        period: 'day',
        duration: 24 * 60 * 60 * 1000,
      }];

      mockTrader.traderScoreService.getTraderData
        .withArgs(mockTrader.id, args)
        .resolves({ scores });

      const expectRsp = [{ scores }, false, undefined];
      await awaitObserveRsp(args, expectRsp);
    });
  });

  describe('verify offline fetch field ttl', () => {
    const verifyTTL = (key, ttl) => {
      mockTrader.observe([key], () => {});

      sinon.assert.calledWith(
        mockTrader.offlineFetcher.fetch,
        sinon.match.any,
        ttl,
        sinon.match.any,
      );
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

  it('sends offline data first then fetch', async () => {
    mockTrader.offlineFetcher.fetch.callsFake((key, ttl, fetch) => (async () => [
      'test-initial',
      (async () => fetch())(),
    ])());

    mockTrader.accountService.getUserData
      .withArgs(mockTrader.id, ['bio'])
      .resolves({ bio: 'test-fetch' });

    await awaitObserveRsp(['bio'], [{ bio: 'test-initial' }, true, undefined]);
    await awaitObserveRsp(['bio'], [{ bio: 'test-fetch' }, false, undefined]);
  }, 500);

  it('sends loading false if not awaiting fetch', async () => {
    mockTrader.offlineFetcher.fetch.callsFake(() => (async () => [
      'test-initial',
      null,
    ])());

    await awaitObserveRsp(['bio'], [{ bio: 'test-initial' }, false, undefined]);
  });

  it('sends error from offline data', async () => {
    mockTrader.offlineFetcher.fetch.rejects(new Error('test error'));
    await awaitObserveRsp(
      ['bio'],
      [
        () => true,
        loading => loading === false,
        err => err.message === 'test error',
      ],
    );
  }, 500);

  it('sends error from fetch', async () => {
    mockTrader.accountService.getUserData.rejects(new Error('test error'));
    await awaitObserveRsp(
      ['bio'],
      [
        () => true,
        loading => loading === false,
        (err) => { const e = err || {}; return e.message === 'test error'; },
      ],
    );
  }, 500);

  it('sends errors from multiple fetch', async () => {
    mockTrader.accountService.getUserData
      .withArgs(mockTrader.id, ['bio'])
      .rejects(new Error('test error'));

    mockTrader.accountService.getUserData
      .withArgs(mockTrader.id, ['website'])
      .rejects(new Error('test error 2'));

    await awaitObserveRsp(
      ['bio', 'website'],
      [
        () => true,
        loading => loading === false,
        (err) => { const e = err || {}; return e.message === 'test error; test error 2'; },
      ],
    );
  }, 500);

  const expectObserveData = (observer, expectData) => new Promise((resolve) => {
    // eslint-disable-next-line no-param-reassign
    observer.fn = (data) => {
      if (isEqual(data, expectData)) {
        resolve();
      }
    };
  });

  it('re-fetches data after ttl', async () => {
    mockTrader.accountService.getUserData
      .withArgs(mockTrader.id, ['bio'])
      .resolves({ bio: 'test-fetch' });

    const observer = { fn: () => {} };
    mockTrader.observe(['bio'], (...rsp) => observer.fn(...rsp));
    await expectObserveData(observer, { bio: 'test-fetch' });

    mockTrader.accountService.getUserData
      .withArgs(mockTrader.id, ['bio'])
      .resolves({ bio: 'test-fetch2' });

    clock.tick(2 * 60 * 60 * 1000);

    await expectObserveData(observer, { bio: 'test-fetch2' });
  }, 500);

  it('re-fetches data after ttl once for multiple observers of same field', async () => {
    mockTrader.accountService.getUserData
      .withArgs(mockTrader.id, ['bio'])
      .resolves({ bio: 'test-fetch' });

    const observer = { fn: () => {} };
    mockTrader.observe(['bio'], (...rsp) => observer.fn(...rsp));
    mockTrader.observe(['bio'], () => {});
    await expectObserveData(observer, { bio: 'test-fetch' });

    mockTrader.offlineFetcher.fetch.resetHistory();
    clock.tick(2 * 60 * 60 * 1000);

    sinon.assert.calledOnce(mockTrader.offlineFetcher.fetch);
  }, 500);

  it('doesn\'t re-fetch data after ttl once all observers are disposed', async () => {
    mockTrader.accountService.getUserData
      .withArgs(mockTrader.id, ['bio'])
      .resolves({ bio: 'test-fetch' });

    const observer = { fn: () => {} };
    const dispose1 = mockTrader.observe(['bio'], (...rsp) => observer.fn(...rsp));
    const dispose2 = mockTrader.observe(['bio'], () => {});
    await expectObserveData(observer, { bio: 'test-fetch' });
    dispose1();
    dispose2();

    observer.fn = sinon.stub();
    mockTrader.offlineFetcher.fetch.resetHistory();
    clock.tick(2 * 60 * 60 * 1000);

    sinon.assert.notCalled(observer.fn);
    sinon.assert.notCalled(mockTrader.offlineFetcher.fetch);
  }, 500);
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
