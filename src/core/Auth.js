import EventEmitter from 'eventemitter3';
import 'es6-promise/auto';
import get from 'lodash.get';

export default class Auth extends EventEmitter {
  constructor({ keycloak }) {
    super();

    this.keycloak = keycloak;

    const token = localStorage.getItem('authAccessToken');
    const refreshToken = localStorage.getItem('authRefreshToken');
    const idToken = localStorage.getItem('authIdToken');

    this.ready = new Promise(resolve => this.once('ready', resolve));

    // eslint-disable-next-line no-param-reassign
    keycloak.onReady = this.onReady.bind(this);
    // eslint-disable-next-line no-param-reassign
    keycloak.onAuthSuccess = this.onAuthSuccess.bind(this);
    // eslint-disable-next-line no-param-reassign
    keycloak.onAuthRefreshSuccess = this.onAuthRefreshSuccess.bind(this);
    // eslint-disable-next-line no-param-reassign
    keycloak.onAuthLogout = this.onAuthLogout.bind(this);

    keycloak.init({
      token,
      refreshToken,
      idToken,
      promiseType: 'native',
    });

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.register = this.register.bind(this);
  }

  async current() {
    await this.ready;
    return {
      id: this.keycloak.subject,
      email: get(this.keycloak, 'tokenParsed.email'),
      username: get(this.keycloak, 'tokenParsed.preferred_username'),
      roles: get(this.keycloak, 'realmAccess.roles'),
    };
  }

  async getAccessToken() {
    await this.ready;

    await this.keycloak.updateToken(5);

    return this.keycloak.token;
  }

  login(redirectUri) {
    this.keycloak.login({
      redirectUri,
    });
  }

  logout(redirectUri) {
    this.keycloak.logout({
      redirectUri,
    });
  }

  register(redirectUri) {
    this.keycloak.register({
      redirectUri,
    });
  }


  onReady() {
    this.settingsUrl = this.keycloak.createAccountUrl();
    this.emit('ready');
    this.emit('authUpdate');
  }

  onAuthSuccess() {
    this.saveTokens();
    this.emit('authUpdate');
  }

  onAuthRefreshSuccess() {
    this.saveTokens();
  }

  onAuthLogout() {
    this.deleteTokens();
    this.emit('authUpdate');
  }

  saveTokens() {
    localStorage.setItem('authAccessToken', this.keycloak.token);
    localStorage.setItem('authRefreshToken', this.keycloak.refreshToken);
    localStorage.setItem('authIdToken', this.keycloak.idToken);
  }

  deleteTokens() {
    localStorage.removeItem('authAccessToken');
    localStorage.removeItem('authRefreshToken');
    localStorage.removeItem('authIdToken');
  }
}
