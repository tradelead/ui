export default class OfflineStorage {
  // eslint-disable-next-line class-methods-use-this
  async fetch(key, ttl, fetch) {
    const { data, time } = await this.get(key);

    let refetchedDataProm;

    if (typeof data === 'undefined' || time + ttl < Date.now()) {
      refetchedDataProm = (async () => {
        const res = await fetch();
        this.update(key, res);
        return res;
      })();
    }

    return [data, refetchedDataProm];
  }

  async get(key) {
    return JSON.parse(localStorage.getItem(key)) || {};
  }

  async update(key, value) {
    localStorage.setItem(key, JSON.stringify({ data: value, time: Date.now() }));
  }
}
