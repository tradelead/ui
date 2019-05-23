import { decorate, observable, reaction } from 'mobx';
import { computedFn } from 'mobx-utils';
import hash from 'object-hash';
import combineError from 'combine-errors';

const getFieldKey = field => (typeof field === 'string' ? field : field.key);

class Trader {
  data = {};

  fieldTTL = {
    bio: 2 * 60 * 60 * 1000,
    website: 2 * 60 * 60 * 1000,
    exchangeKeys: 30 * 1000,
    score: 60 * 1000,
    rank: 60 * 1000,
  };

  // eslint-disable-next-line prefer-arrow-callback, func-names
  getData = computedFn(function getData(fields) {
    const rsp = {
      data: {},
      loading: false,
    };

    const errors = [];

    fields.forEach((field) => {
      const key = getFieldKey(field);
      const fieldHash = hash(field);
      const { data, loading, error } = this.data[fieldHash];
      rsp.data[key] = data;

      if (loading) {
        rsp.loading = true;
      }

      if (error) {
        errors.push(error);
      }
    });

    if (errors.length > 0) {
      rsp.error = combineError(errors);
    }

    return rsp;
  });

  constructor({
    id,
    roles,
    accountService,
    traderScoreService,
    offlineFetcher,
  }) {
    this.id = id;
    this.roles = roles;
    this.accountService = accountService;
    this.traderScoreService = traderScoreService;
    this.offlineFetcher = offlineFetcher;
    this.registerFieldWatch = this.registerFieldWatch.bind(this);
  }

  observe(fields, callback) {
    const fieldWatchDispose = fields.map(this.registerFieldWatch);

    const dispose = reaction(
      () => this.getData(fields),
      ({ data, loading, error }) => callback(data, loading, error),
    );

    return () => {
      fieldWatchDispose.forEach((fieldDispose) => { fieldDispose(); });
      dispose();
    };
  }

  registerFieldWatch(field) {
    const key = getFieldKey(field);
    const fieldHash = hash(field);
    this.data[fieldHash] = this.data[fieldHash] || {};
    this.data[fieldHash].observerCount += 1;

    this.updateField(field);

    if (this.data[fieldHash].observerCount === 1) {
      // first observer register auto refresh
      this.data[fieldHash].intervalId = setInterval(() => {
        this.updateField(field);
      }, this.fieldTTL[key]);
    }

    return () => {
      this.data[fieldHash].observerCount -= 1;

      if (this.data[fieldHash].observerCount <= 0) {
        clearInterval(this.data[fieldHash].intervalId);
        delete this.data[fieldHash];
      }
    };
  }

  async updateField(field) {
    const key = getFieldKey(field);
    const fieldHash = hash(field);

    try {
      const [initialData, refetchedDataProm] = await this.offlineFetcher.fetch(
        fieldHash,
        this.fieldTTL[key],
        async () => this.fetchFieldFromDataSource(field),
      );

      this.data[fieldHash] = this.data[fieldHash] || {};
      this.data[fieldHash].loading = true;
      this.data[fieldHash].data = initialData;

      if (refetchedDataProm) {
        this.data[fieldHash].data = await refetchedDataProm;
      }
    } catch (e) {
      this.data[fieldHash].error = e;
    } finally {
      this.data[fieldHash].loading = false;
    }
  }

  async fetchFieldFromDataSource(field) {
    const key = getFieldKey(field);

    if (['score', 'rank'].includes(key)) {
      const rsp = await this.traderScoreService.getTraderData(this.id, [field]);
      return rsp[key];
    }

    if (['bio', 'website', 'exchangeKeys'].includes(key)) {
      const rsp = await this.accountService.getUserData(this.id, [field]);
      return rsp[key];
    }

    return null;
  }
}

decorate(Trader, {
  data: [observable],
});

export default Trader;
