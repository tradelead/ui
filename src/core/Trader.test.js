import sinon from 'sinon';
import isEqual from 'lodash.isequal';
import sleep from '../utils/sleep';
import Trader from './Trader';

const mockTrader = new Trader({
  id: 'test123',
  roles: ['test1', 'test2'],
  accountService: { getUserData: sinon.stub() },
  traderScoreService: { getTraderData: sinon.stub() },
  offlineFetcher: { fetch: sinon.stub() },
});

describe('observe', () => {
  describe('verify field source', () => {
    const awaitObserveRsp = (args, expectRsp) => new Promise(async (resolve) => {
      mockTrader.observe(args, (...rsp) => {
        if (isEqual(rsp, expectRsp)) {
          resolve(true);
        }
      });
    });

    beforeEach(() => {
      mockTrader.offlineFetcher.fetch.callsFake((key, ttl, fetch) => (async () => [
        null,
        (async () => fetch())(),
      ])());
    });

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
  });

  describe('verify offline fetch field ttl', () => {
    test('bio ttl is 2 hours', async () => {

    });

    test('website ttl is 2 hours', async () => {

    });

    test('exchangeKeys ttl is 30 seconds', async () => {

    });

    test('score ttl is 60 seconds', async () => {

    });

    test('rank ttl is 60 seconds', async () => {

    });
  });

  it('sends offline data first', async () => {

  });

  it('sends loading false if not awaiting fetch', async () => {

  });

  it('sends loading true if awaiting fetch', async () => {

  });

  it('sends loading false after fetch', async () => {

  });

  it('sends error from offline data', async () => {

  });

  it('sends error from fetch', async () => {

  });

  it('sends errors from multiple fetch', async () => {

  });

  it('re-fetches data after ttl', async () => {

  });

  it('re-fetches data after ttl once for multiple observers of same field', async () => {

  });

  it('doesn\'t re-fetch data after ttl once all observers are disposed', async () => {

  });
});
