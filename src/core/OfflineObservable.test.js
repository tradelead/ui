import sinon from 'sinon';
import isEqual from 'lodash.isequal';
import OfflineObservable from './OfflineObservable';

const clock = sinon.useFakeTimers();

let observable;

beforeEach(() => {
  observable = new OfflineObservable({
    fieldKey: sinon.stub(),
    fetch: sinon.stub(),
    ttl: sinon.stub(),
  });

  observable.offlineFetcher = {
    fetch: sinon.stub(),
  };

  observable.fieldKey.callsFake(field => (typeof field === 'string' ? field : field.key));
  observable.ttl.returns(5000);

  observable.offlineFetcher.fetch.callsFake((key, ttl, fetch) => (async () => [
    null,
    (async () => fetch())(),
  ])());
});

const compare = (value, expected) => {
  if (typeof expected === 'function') {
    return expected(value);
  }

  return isEqual(value, expected);
};

describe('observe', () => {
  const awaitObserveRsp = (args, expectRsp) => new Promise(async (resolve) => {
    const dispose = observable.observe(args, (...rsp) => {
      const dataValid = compare(rsp[0], expectRsp[0]);
      const loadingValid = compare(rsp[1], expectRsp[1]);
      const errorValid = compare(rsp[2], expectRsp[2]);

      if (dataValid && loadingValid && errorValid) {
        resolve(true);
        dispose();
      }
    });
  });

  describe('fetch', () => {
    it('sends offline data first then fetch', async () => {
      observable.offlineFetcher.fetch.callsFake((key, ttl, fetch) => (async () => [
        'test-initial',
        (async () => fetch())(),
      ])());

      observable.fetch
        .withArgs('bio')
        .resolves('test-fetch');

      await awaitObserveRsp(['bio'], [{ bio: 'test-initial' }, true, undefined]);
      await awaitObserveRsp(['bio'], [{ bio: 'test-fetch' }, false, undefined]);
    }, 500);

    it('sends loading false if not awaiting fetch', async () => {
      observable.offlineFetcher.fetch.callsFake(() => (async () => [
        'test-initial',
        null,
      ])());

      await awaitObserveRsp(['bio'], [{ bio: 'test-initial' }, false, undefined]);
    }, 500);

    it('sends error from offline data', async () => {
      observable.offlineFetcher.fetch.rejects(new Error('test error'));
      await awaitObserveRsp(
        ['bio'],
        [
          () => true,
          loading => loading === false,
          (err) => { const e = err || {}; return e.message === 'test error'; },
        ],
      );
    }, 500);

    it('sends error from fetch', async () => {
      observable.fetch.rejects(new Error('test error'));
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
      observable.fetch
        .withArgs('bio')
        .rejects(new Error('test error'));

      observable.fetch
        .withArgs('website')
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
      observable.fetch
        .withArgs('bio')
        .resolves('test-fetch');

      const observer = { fn: () => {} };
      observable.observe(['bio'], (...rsp) => observer.fn(...rsp));
      await expectObserveData(observer, { bio: 'test-fetch' });

      observable.fetch
        .withArgs('bio')
        .resolves('test-fetch2');

      clock.tick(2 * 60 * 60 * 1000);

      await expectObserveData(observer, { bio: 'test-fetch2' });
    }, 500);

    it('re-fetches data after ttl once for multiple observers of same field', async () => {
      observable.fetch
        .withArgs('bio')
        .resolves('test-fetch');

      const observer = { fn: () => {} };
      observable.observe(['bio'], (...rsp) => observer.fn(...rsp));
      observable.observe(['bio'], () => {});
      await expectObserveData(observer, { bio: 'test-fetch' });

      observable.offlineFetcher.fetch.resetHistory();
      clock.tick(5000);

      sinon.assert.calledOnce(observable.offlineFetcher.fetch);
    }, 500);

    it('doesn\'t re-fetch data after ttl once all observers are disposed', async () => {
      observable.fetch
        .withArgs('bio')
        .resolves('test-fetch');

      const observer = { fn: () => {} };
      const dispose1 = observable.observe(['bio'], (...rsp) => observer.fn(...rsp));
      const dispose2 = observable.observe(['bio'], () => {});
      await expectObserveData(observer, { bio: 'test-fetch' });
      dispose1();
      dispose2();

      observer.fn = sinon.stub();
      observable.offlineFetcher.fetch.resetHistory();
      clock.tick(5000);

      sinon.assert.notCalled(observer.fn);
      sinon.assert.notCalled(observable.offlineFetcher.fetch);
    }, 500);
  });

  describe('subscribe', () => {
    const expectObserveData = (observer, expectRsp) => new Promise((resolve) => {
      // eslint-disable-next-line no-param-reassign
      observer.fn = (...rsp) => {
        const dataValid = compare(rsp[0], expectRsp[0]);
        const loadingValid = compare(rsp[1], expectRsp[1]);
        const errorValid = compare(rsp[2], expectRsp[2]);

        if (dataValid && loadingValid && errorValid) {
          resolve();
        }
      };
    });

    beforeEach(() => {
      observable = new OfflineObservable({
        fieldKey: sinon.stub(),
        subscribe: sinon.stub(),
      });

      observable.fieldKey.callsFake(field => (typeof field === 'string' ? field : field.key));

      observable.offlineFetcher = {
        update: sinon.stub(),
        get: sinon.stub(),
      };
    });

    it('calls for each field', () => {
      observable.observe(['bio', 'website'], () => {});
      sinon.assert.calledWith(observable.subscribe, 'bio');
      sinon.assert.calledWith(observable.subscribe, 'website');
    });

    it('updates with data from callback', async () => {
      const expectedRsp = {
        data: { test: 1 },
        loading: true,
        error: new Error('test'),
      };

      observable.subscribe.callsFake((field, callback) => {
        callback(expectedRsp);
      });

      await awaitObserveRsp(['bio'], [
        { bio: expectedRsp.data },
        expectedRsp.loading,
        (err) => { const e = err || {}; return e.message === 'test'; },
      ]);
    }, 500);

    it('updates from subscribe callback update offlineFetcher', async () => {
      let subscribeCallback;
      observable.subscribe.callsFake((field, callback) => {
        subscribeCallback = callback;
      });

      observable.observe(['bio'], () => {});
      subscribeCallback({ data: { test: 1 } });
      sinon.assert.calledWith(observable.offlineFetcher.update, sinon.match.any, { test: 1 });
    });

    it('won\'t update undefined values', async () => {
      const expectedRsp = {
        data: { test: 1 },
        loading: true,
        error: new Error('test'),
      };

      let subscribeCallback = null;
      observable.subscribe.callsFake((field, callback) => {
        subscribeCallback = callback;
      });

      const observer = { fn: () => {} };
      observable.observe(['bio'], (...rsp) => observer.fn(...rsp));

      let assert = expectObserveData(observer, [
        { bio: expectedRsp.data },
        expectedRsp.loading,
        (err) => { const e = err || {}; return e.message === 'test'; },
      ]);

      subscribeCallback(expectedRsp);

      await assert;

      assert = expectObserveData(observer, [
        { bio: expectedRsp.data },
        expectedRsp.loading,
        (err) => { const e = err || {}; return e.message === 'test'; },
      ]);

      subscribeCallback({});

      await assert;
    }, 500);

    it('by default returns loading until first callback call', async () => {
      let subscribeCallback = null;
      observable.subscribe.callsFake((field, callback) => {
        subscribeCallback = callback;
      });

      const observer = { fn: () => {} };
      observable.observe(['bio'], (...rsp) => observer.fn(...rsp));

      await expectObserveData(observer, [
        data => data.bio == null,
        true,
        () => true,
      ]);

      const assert = expectObserveData(observer, [
        data => data.bio === 'bio',
        loading => !loading,
        () => true,
      ]);

      subscribeCallback({ data: 'bio' });

      await assert;
    }, 500);

    it('returns initial data from offlineFetcher.get', async () => {
      observable.offlineFetcher.get.resolves('test');

      await awaitObserveRsp(['bio'], [
        data => data.bio === 'test',
        loading => loading === true,
        () => true,
      ]);
    }, 500);

    it('doesn\'t update data after subscribe disposed', async () => {
      let subscribeCallback = null;
      observable.subscribe.callsFake((field, callback) => {
        subscribeCallback = callback;
      });

      const observer = { fn: sinon.stub() };
      const dispose = observable.observe(['bio'], (...rsp) => observer.fn(...rsp));
      dispose();
      observer.fn.resetHistory();
      subscribeCallback({ data: 'bio' });

      sinon.assert.notCalled(observer.fn);
    });

    it('calls subscribe returned dispose function', async () => {
      const testDisposeFn = sinon.spy();
      observable.subscribe.returns(testDisposeFn);
      const dispose = observable.observe(['bio'], () => {});
      dispose();
      sinon.assert.calledOnce(testDisposeFn);
    });
  });
});
