import { decorate, observable, reaction } from 'mobx';
import { computedFn } from 'mobx-utils';
import hash from 'object-hash';
import combineError from 'combine-errors';
import OfflineFetcher from './OfflineFetcher';

class OfflineObservable {
  store = {};

  // eslint-disable-next-line prefer-arrow-callback, func-names
  getData = computedFn(function getData(fields) {
    const rsp = {
      data: {},
      loading: false,
    };

    const errors = [];

    fields.forEach((field) => {
      const key = this.fieldKey(field);
      const fieldHash = hash(field);
      const fieldData = this.store[fieldHash];
      if (fieldData) {
        rsp.data[key] = fieldData.data;
      }

      if (fieldData && fieldData.loading) {
        rsp.loading = true;
      }

      if (fieldData && fieldData.error) {
        errors.push(fieldData.error);
      }
    });

    if (errors.length > 0) {
      rsp.error = combineError(errors);
    }

    return rsp;
  });

  constructor({
    fieldKey,
    fetch,
    subscribe,
    ttl,
  }) {
    this.fieldKey = fieldKey;
    this.fetch = fetch;
    this.subscribe = subscribe;
    this.ttl = ttl;
    this.offlineFetcher = new OfflineFetcher();
  }

  observe(fields, callback) {
    const fieldWatchDispose = fields.map(this.registerFieldWatch.bind(this));

    const send = ({ data, loading, error }) => callback(data, loading, error);

    const dispose = reaction(
      () => this.getData(fields),
      send,
    );

    process.nextTick(() => send(this.getData(fields)));

    return () => {
      fieldWatchDispose.forEach((fieldDispose) => { fieldDispose(); });
      dispose();
    };
  }

  registerFieldWatch(field) {
    const fieldHash = hash(field);
    this.store[fieldHash] = this.store[fieldHash] || {};
    this.store[fieldHash].observerCount = this.store[fieldHash].observerCount || 0;
    this.store[fieldHash].observerCount += 1;

    if (this.store[fieldHash].observerCount === 1) {
      if (this.subscribe) {
        this.store[fieldHash].subscribeDispose = this.subscribeField(field);
      } else if (this.ttl && this.fetch) {
        this.store[fieldHash].intervalId = setInterval(() => {
          this.fetchField(field);
        }, this.ttl(field));
      }
    }

    if (this.fetch && !this.subscribe) {
      this.fetchField(field);
    }

    return () => {
      this.store[fieldHash].observerCount -= 1;

      if (this.store[fieldHash].observerCount <= 0) {
        clearInterval(this.store[fieldHash].intervalId);

        if (typeof this.store[fieldHash].subscribeDispose === 'function') {
          this.store[fieldHash].subscribeDispose();
        }

        delete this.store[fieldHash];
      }
    };
  }

  subscribeField(field) {
    if (!this.subscribe) { return null; }
    const fieldHash = hash(field);

    (async () => {
      const initial = await this.offlineFetcher.get(fieldHash);
      if (typeof this.store[fieldHash].data === 'undefined') {
        this.store[fieldHash].data = initial;
        this.store[fieldHash].loading = true;
      }
    })();

    let first = true;
    return this.subscribe(field, ({ data, loading, error }) => {
      if (!this.store[fieldHash]) { return; }

      if (first) {
        first = false;
        this.store[fieldHash].loading = false;
      }

      if (typeof data !== 'undefined') {
        this.offlineFetcher.update(fieldHash, data);
        this.store[fieldHash].data = data;
      }

      if (typeof loading !== 'undefined') {
        this.store[fieldHash].loading = loading;
      }

      if (typeof error !== 'undefined') {
        this.store[fieldHash].error = error;
      }
    });
  }

  async fetchField(field) {
    if (!this.fetch) { return; }
    const fieldHash = hash(field);

    try {
      const [initialData, refetchedDataProm] = await this.offlineFetcher.fetch(
        fieldHash,
        this.ttl(field),
        async () => this.fetch(field),
      );

      this.store[fieldHash].loading = true;
      this.store[fieldHash].data = initialData;

      if (refetchedDataProm) {
        const updatedData = await refetchedDataProm;
        if (this.store[fieldHash]) {
          this.store[fieldHash].data = updatedData;
        }
      }
    } catch (e) {
      if (this.store[fieldHash]) {
        this.store[fieldHash].error = e;
      }
    } finally {
      if (this.store[fieldHash]) {
        this.store[fieldHash].loading = false;
      }
    }
  }
}

decorate(OfflineObservable, {
  store: [observable],
});

export default OfflineObservable;
