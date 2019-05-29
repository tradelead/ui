import sinon from 'sinon';
import sleep from '../utils/sleep';
import Auth from './Auth';
import LocalStorageMock from './LocalStorageMock';

let keycloak;
beforeEach(() => {
  global.localStorage = new LocalStorageMock();
  global.localStorage.clear();

  keycloak = {
    init: sinon.stub(),
    login: sinon.stub(),
    logout: sinon.stub(),
    register: sinon.stub(),
    createAccountUrl: sinon.stub(),
    isTokenExpired: sinon.stub(),
    updateToken: sinon.stub(),
    clearToken: sinon.stub(),
  };

  // mocking real behavior of module
  keycloak.clearToken.callsFake(() => {
    if (typeof keycloak.onAuthLogout === 'function') {
      keycloak.onAuthLogout();
    }
  });
});

const setupToken = () => {
  localStorage.setItem('authAccessToken', 'access123');
  localStorage.setItem('authRefreshToken', 'refresh123');
  localStorage.setItem('authIdToken', 'id123');
};

it('initializes with tokens from storage', () => {
  setupToken();

  // eslint-disable-next-line no-unused-vars
  const auth = new Auth({ keycloak });

  sinon.assert.calledWithMatch(keycloak.init, {
    token: 'access123',
    refreshToken: 'refresh123',
    idToken: 'id123',
  });
});

describe('authUpdate event', () => {
  let authUpdateSpy;
  beforeEach(() => {
    const auth = new Auth({ keycloak });

    authUpdateSpy = sinon.spy();
    auth.on('authUpdate', authUpdateSpy);
  });

  it('triggers upon keycloak.onReady', () => {
    keycloak.onReady();
    sinon.assert.calledOnce(authUpdateSpy);
  });

  it('triggers upon keycloak.onAuthSuccess', () => {
    keycloak.onAuthSuccess();
    sinon.assert.calledOnce(authUpdateSpy);
  });

  it('triggers upon keycloak.onAuthLogout', () => {
    keycloak.onAuthLogout();
    sinon.assert.calledOnce(authUpdateSpy);
  });
});

describe('delete tokens', () => {
  const assertTokensDeleted = () => {
    expect(localStorage.getItem('authAccessToken')).toBeFalsy();
    expect(localStorage.getItem('authRefreshToken')).toBeFalsy();
    expect(localStorage.getItem('authIdToken')).toBeFalsy();
  };

  it('triggers upon keycloak.onAuthLogout', () => {
    setupToken();
    // eslint-disable-next-line no-unused-vars
    const auth = new Auth({ keycloak });
    keycloak.onAuthLogout();
    assertTokensDeleted();
  });
});

describe('save tokens', () => {
  const keycloakPopulateTokens = () => {
    keycloak.token = 'access123';
    keycloak.refreshToken = 'refresh123';
    keycloak.idToken = 'id123';
  };

  const assertTokensSaved = () => {
    expect(localStorage.getItem('authAccessToken')).toEqual('access123');
    expect(localStorage.getItem('authRefreshToken')).toEqual('refresh123');
    expect(localStorage.getItem('authIdToken')).toEqual('id123');
  };

  it('triggers upon keycloak.onAuthSuccess', () => {
    keycloakPopulateTokens();
    // eslint-disable-next-line no-unused-vars
    const auth = new Auth({ keycloak });
    keycloak.onAuthSuccess();
    assertTokensSaved();
  });

  it('triggers upon keycloak.onAuthRefreshSuccess', () => {
    keycloakPopulateTokens();
    // eslint-disable-next-line no-unused-vars
    const auth = new Auth({ keycloak });
    keycloak.onAuthRefreshSuccess();
    assertTokensSaved();
  });
});

describe('current()', () => {
  it('resolves with id, email, username, roles parsed from token once ready', async () => {
    const auth = new Auth({ keycloak });
    keycloak.onReady();
    keycloak.realmAccess = {
      roles: ['testRole', 'testRole2'],
    };
    keycloak.subject = 'user123';
    keycloak.tokenParsed = {
      email: 'test@test.com',
      preferred_username: 'test',
    };

    const res = await auth.current();
    expect(res).toEqual({
      id: 'user123',
      email: 'test@test.com',
      username: 'test',
      roles: ['testRole', 'testRole2'],
    });
  });

  it('doesn\'t resolve if ready not called', async () => {
    const auth = new Auth({ keycloak });

    let resolved = false;
    (async () => {
      await auth.current();
      resolved = true;
    })();

    await sleep(0);
    expect(resolved).toBeFalsy();
  });
});

describe('getAccessToken()', () => {
  it('doesn\'t resolve if ready not called', async () => {
    const auth = new Auth({ keycloak });

    let resolved = false;
    (async () => {
      await auth.getAccessToken();
      resolved = true;
    })();

    await sleep(0);
    expect(resolved).toBeFalsy();
  });

  it('resolves with token once ready when updateToken resolves', async () => {
    const auth = new Auth({ keycloak });
    keycloak.onReady();
    keycloak.token = 'token123';
    keycloak.updateToken.withArgs(5).resolves(false);

    const token = await auth.getAccessToken();
    expect(token).toEqual('token123');
  });

  it('throws error once ready when token refresh fails', async () => {
    const auth = new Auth({ keycloak });
    keycloak.onReady();
    keycloak.token = 'token123';
    keycloak.updateToken.withArgs(5).rejects();

    await expect(auth.getAccessToken()).rejects.toThrow();
  });
});

describe('login', () => {
  it('calls keycloak.login', () => {
    const { login } = new Auth({ keycloak });
    login('http://test.com');
    sinon.assert.calledWith(keycloak.login, { redirectUri: 'http://test.com' });
  });
});

describe('logout', () => {
  it('calls keycloak.logout', () => {
    const { logout } = new Auth({ keycloak });
    logout('http://test.com');
    sinon.assert.calledWith(keycloak.logout, { redirectUri: 'http://test.com' });
  });
});

describe('register', () => {
  it('calls keycloak.register once ready', () => {
    const { register } = new Auth({ keycloak });
    register('http://test.com');
    sinon.assert.calledWith(keycloak.register, { redirectUri: 'http://test.com' });
  });
});

describe('settingsUrl', () => {
  it('is set to the url from createAccountUrl once ready', () => {
    keycloak.createAccountUrl.returns('http://test.com');
    const auth = new Auth({ keycloak });
    keycloak.onReady();
    expect(auth.settingsUrl).toEqual('http://test.com');
  });
});
