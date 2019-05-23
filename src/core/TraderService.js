export default class TraderService {
  constructor({ accountService, offlineFetcher }) {
    this.accountService = accountService;
    this.offlineFetcher = offlineFetcher;
  }

  async getTrader(id) {
    const fetchFromSource = async userID => this.accountService.getUser(userID);
    const [initialData, refetchedDataProm] = await this.offlineFetcher.fetch(
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
