const mockAuth = {
  current: async () => ({
    id: 'trader123',
    username: 'tradername123',
  }),
  getAccessToken: async () => null,
  on: () => {},
  login: () => {},
  register: () => {},
  logout: () => {},
  removeListener: () => {},
};

export default mockAuth;
