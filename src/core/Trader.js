import { observable, reaction } from 'mobx';
import { computedFn } from 'mobx-utils';

export default class Trader {
  @observable data = [];

  getData = computedFn(function getData(fields) {
    // return this.data.filter(...))
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
  }

  observe(fields, callback) {

    return reaction(
      () => getData(fields),
      data => callback(data),
    );
  }
}
