class Trader {
  constructor({
    id,
    roles,
    accountService,
    traderScoreService,
    offlineObservable,
  }) {
    this.id = id;
    this.roles = roles;
    this.accountService = accountService;
    this.traderScoreService = traderScoreService;
    this.offlineObservable = offlineObservable;
  }

  observe(fields, callback) {
    return this.offlineObservable({
      fields,
      callback,
      getFieldKey: field => (typeof field === 'string' ? field : field.key),
      getFieldTTL(field) {
        const fieldTTL = {
          bio: 2 * 60 * 60 * 1000,
          website: 2 * 60 * 60 * 1000,
          exchangeKeys: 30 * 1000,
          score: 60 * 1000,
          rank: 60 * 1000,
          scores: 60 * 1000,
        };

        return fieldTTL[this.getFieldKey(field)];
      },
      async fetch(field) {
        const key = this.getFieldKey(field);

        if (['scores', 'score', 'rank'].includes(key)) {
          const rsp = await this.traderScoreService.getTraderData(this.id, [field]);
          return rsp[key];
        }

        if (['bio', 'website', 'exchangeKeys'].includes(key)) {
          const rsp = await this.accountService.getUserData(this.id, [field]);
          return rsp[key];
        }

        return null;
      },
    });
  }
}