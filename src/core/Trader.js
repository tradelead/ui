import axios from 'axios';
import OfflineObservable from './OfflineObservable';

export default class Trader {
  fieldTTL = {
    bio: 2 * 60 * 60 * 1000,
    website: 2 * 60 * 60 * 1000,
    exchangeKeys: 30 * 1000,
    score: 60 * 1000,
    rank: 60 * 1000,
    scores: 60 * 1000,
  };

  constructor({
    id,
    roles,
    accountService,
    traderScoreService,
  }) {
    this.id = id;
    this.roles = roles;
    this.accountService = accountService;
    this.traderScoreService = traderScoreService;

    this.offlineObservable = new OfflineObservable({
      fieldKey: Trader.fieldKey,
      ttl: this.ttl.bind(this),
      fetch: this.fetch.bind(this),
    });

    this.observe = this.offlineObservable.observe.bind(this.offlineObservable);
  }

  static fieldKey(field) {
    return typeof field === 'string' ? field : field.key;
  }

  ttl(field) {
    return this.fieldTTL[Trader.fieldKey(field)];
  }

  async fetch(field) {
    const key = Trader.fieldKey(field);

    if (['scores', 'score', 'rank'].includes(key)) {
      const rsp = await this.traderScoreService.getTraderData(this.id, [field]);
      return rsp[key];
    }

    if (['bio', 'website', 'exchangeKeys'].includes(key)) {
      const rsp = await this.accountService.getUserData(this.id, [field]);
      return rsp[key];
    }

    return null;
  }

  async upload({ key, file }, progressFn) {
    const signedUpload = this.accountService.signUpload(this.id, key);

    const form = new FormData();

    Object.keys(signedUpload.fields).forEach((property) => {
      form.append(property, signedUpload.fields[property]);
    });

    form.append('Content-Type', file.type);
    form.append('file', file, { contentType: file.type });

    await axios.post(signedUpload.url, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (e) => {
        const p = Math.trunc(Math.round((e.loaded * 100) / e.total));
        progressFn(p);
      },
    });
  }

  async update(data) {
    return this.accountService.updateUser(data);
  }

  async addExchangeKey(data) {
    return this.accountService.addExchangeKey(data);
  }

  async deleteExchangeKey(data) {
    return this.accountService.deleteExchangeKey(data);
  }
}
