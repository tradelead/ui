import sinon from 'sinon';
import Auth from './Auth';

beforeEach(() => {
  const keycloak = {
    init: sinon.stub(),
    login: sinon.stub(),
    logout: sinon.stub(),
    register: sinon.stub(),
    accountManagement: sinon.stub(),
    isTokenExpired: sinon.stub(),
    updateToken: sinon.stub(),
    clearToken: sinon.stub(),
  };
  new Auth({ keyclock });
});