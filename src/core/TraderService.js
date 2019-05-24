import OfflineStorage from './OfflineStorage';
import OfflineObservable from './OfflineObservable';

export default class TraderService {
  fieldTTL = {
    topTraders: 15000,
  };

  constructor({ accountService, traderScoreService }) {
    this.accountService = accountService;
    this.traderScoreService = traderScoreService;

    this.offlineObservable = new OfflineObservable({
      fieldKey: this.fieldKey.bind(this),
      ttl: this.ttl.bind(this),
      fetch: this.fetch.bind(this),
    });

    this.offlineStorage = new OfflineStorage();
  }

  async getTrader(id) {
    const fetchFromSource = async userID => this.accountService.getUser(userID);
    const [initialData, refetchedDataProm] = await this.offlineStorage.fetch(
      `trader-${id}`,
      24 * 60 * 60 * 1000,
      async () => fetchFromSource(id),
    );

    if (!refetchedDataProm) {
      return initialData;
    }

    try {
      const res = await refetchedDataProm;
      return res;
    } catch (e) {
      // noop
    }

    return initialData;
  }

  observeTopTraders(args, callback) {
    const field = { key: 'topTraders', ...args };
    this.offlineObservable.observe([field], callback);
  }

  async fetch(field) {
    const key = this.fieldKey(field);

    if (key === 'topTraders') {
      const { period, limit } = field;
      return this.traderScoreService.getTopTraders({ period, limit });
    }

    return {};
  }

  fieldKey(field) {
    if (typeof field !== 'object') { return null; }
    return field.key;
  }

  ttl(field) {
    return this.fieldTTL[this.fieldKey(field)];
  }
}
