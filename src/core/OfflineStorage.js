export default class OfflineStorage {
  // eslint-disable-next-line class-methods-use-this
  async fetch(key, ttl, fetch) {
    const { data, time } = JSON.parse(localStorage.getItem(key)) || {};

    let refetchedDataProm;

    if (typeof data === 'undefined' || time + ttl < Date.now()) {
      refetchedDataProm = (async () => {
        const res = await fetch();
        localStorage.setItem(key, JSON.stringify({ data: res, time: Date.now() }));
        return res;
      })();
    }

    return [data, refetchedDataProm];
  }
}
