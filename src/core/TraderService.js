export default class TraderService {
  constructor({ accountService, offlineStorage }) {
    this.accountService = accountService;
    this.offlineStorage = offlineStorage;
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
}
