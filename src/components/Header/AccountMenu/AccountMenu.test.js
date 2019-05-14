import React from 'react';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import AccountMenu from './AccountMenu';
import AppContext from '../../../AppContext';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let ctx;

beforeEach(() => {
  ctx = {
    auth: {
      login: sinon.stub(),
      register: sinon.stub(),
      logout: sinon.stub(),
    },
    trader: {
      get: sinon.stub(),
    },
  };
});

// eslint-disable-next-line react/prop-types
function TestAccountMenu({ value }) {
  return (
    <Router><AppContext.Provider value={value}><AccountMenu /></AppContext.Provider></Router>
  );
}

async function mountAsync(component) {
  let el;

  await act(async () => {
    el = mount(component);
  });

  el.update();

  return el;
}

describe('when not logged in', () => {
  it('shows login and sign up buttons', () => {
    const el = mount(<TestAccountMenu value={ctx} />);
    expect(el.find('button.login').text()).toEqual('Login');
    expect(el.find('button.signup').text()).toEqual('Sign Up');
  });

  it('calls auth login when login button clicked', () => {
    const el = mount(<TestAccountMenu value={ctx} />);
    el.find('button.login').simulate('click');
    sinon.assert.called(ctx.auth.login);
  });

  it('calls auth register when sign up button clicked', () => {
    const el = mount(<TestAccountMenu value={ctx} />);
    el.find('button.signup').simulate('click');
    sinon.assert.called(ctx.auth.register);
  });
});

describe('when logged in', () => {
  beforeEach(() => {
    ctx.trader.id = 'trader123';
  });

  it('doesn\'t show login and sign up buttons', () => {
    const el = mount(<TestAccountMenu value={ctx} />);
    expect(el.find('button.login')).toHaveLength(0);
    expect(el.find('button.signup')).toHaveLength(0);
  });

  it('calls auth logout when logout button clicked', () => {
    const el = mount(<TestAccountMenu value={ctx} />);
    el.find('button.logout').simulate('click');
    sinon.assert.called(ctx.auth.logout);
  });

  describe('profile photo', () => {
    it('shows default when profile photo empty', () => {
      const el = mount(<TestAccountMenu value={ctx} />);
      const expectedUrl = `${process.env.PUBLIC_URL}/imgs/default-profile-thumbnail.png`;
      expect(el.find('.profilePhoto img').prop('src')).toEqual(expectedUrl);
    });

    it('shows trader\'s profile photo', async () => {
      const expectedUrl = `${process.env.PUBLIC_URL}/imgs/test.png`;
      ctx.trader.get
        .withArgs('profilePhoto', { size: 'thumbnail' })
        .resolves({ url: expectedUrl });

      const el = await mountAsync(<TestAccountMenu value={ctx} />);

      expect(el.find('.profilePhoto img').prop('src')).toEqual(expectedUrl);
    });
  });

  describe('toggle menu', () => {
    it('shows menu when toggle clicked', () => {
      const el = mount(<TestAccountMenu value={ctx} />);
      el.find('.toggle-account-menu').simulate('click');
      expect(el.find('.account-menu-open')).toHaveLength(1);
    });

    it('closes menu when toggle clicked', async () => {
      const listeners = {};
      document.addEventListener = jest.fn((event, cb) => {
        listeners[event] = cb;
      });

      const el = mount(<div className="test-wrapper"><TestAccountMenu value={ctx} /></div>);
      el.find('.toggle-account-menu').simulate('click'); // open
      act(() => {
        listeners.click({ target: el.getDOMNode() }); // then close
      });

      await sleep(0);
      el.update();

      expect(el.find('.account-menu-open')).toHaveLength(0);
    });

    it('does\'t closes menu when menu clicked', async () => {
      const listeners = {};
      document.addEventListener = jest.fn((event, cb) => {
        listeners[event] = cb;
      });

      const el = mount(<div className="test-wrapper"><TestAccountMenu value={ctx} /></div>);
      el.find('.toggle-account-menu').simulate('click'); // open
      el.find('.account-menu li').first().simulate('click');

      expect(el.find('.account-menu-open')).toHaveLength(1);
    });
  });
});
