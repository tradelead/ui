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
  let wrapper;

  await act(async () => {
    wrapper = mount(component);
  });

  await sleep(0);
  wrapper.update();
  await sleep(0);

  return wrapper;
}

describe('when not logged in', () => {
  it('shows login and sign up buttons', () => {
    const wrapper = mount(<TestAccountMenu value={ctx} />);
    expect(wrapper.find('button.login').text()).toEqual('Login');
    expect(wrapper.find('button.signup').text()).toEqual('Sign Up');
  });

  it('calls auth login when login button clicked', () => {
    const wrapper = mount(<TestAccountMenu value={ctx} />);
    wrapper.find('button.login').simulate('click');
    sinon.assert.called(ctx.auth.login);
  });

  it('calls auth register when sign up button clicked', () => {
    const wrapper = mount(<TestAccountMenu value={ctx} />);
    wrapper.find('button.signup').simulate('click');
    sinon.assert.called(ctx.auth.register);
  });
});

describe('when logged in', () => {
  beforeEach(() => {
    ctx.trader.id = 'trader123';
  });

  it('doesn\'t show login and sign up buttons', () => {
    const wrapper = mount(<TestAccountMenu value={ctx} />);
    expect(wrapper.find('button.login')).toHaveLength(0);
    expect(wrapper.find('button.signup')).toHaveLength(0);
  });

  it('calls auth logout when logout button clicked', () => {
    const wrapper = mount(<TestAccountMenu value={ctx} />);
    wrapper.find('button.logout').simulate('click');
    sinon.assert.called(ctx.auth.logout);
  });

  describe('profile photo', () => {
    it('shows default when profile photo empty', () => {
      const wrapper = mount(<TestAccountMenu value={ctx} />);
      const expectedUrl = `${process.env.PUBLIC_URL}/imgs/default-profile-thumbnail.png`;
      expect(wrapper.find('.profilePhoto img').prop('src')).toEqual(expectedUrl);
    });

    it('shows trader\'s profile photo', async () => {
      const expectedUrl = `${process.env.PUBLIC_URL}/imgs/test.png`;
      ctx.trader.get
        .withArgs([{ key: 'profilePhoto', size: 'thumbnail' }])
        .resolves({ profilePhoto: { url: expectedUrl } });

      const wrapper = await mountAsync(<TestAccountMenu value={ctx} />);

      expect(wrapper.find('.profilePhoto img').prop('src')).toEqual(expectedUrl);
    });
  });

  describe('toggle menu', () => {
    it('shows menu when toggle clicked', () => {
      const wrapper = mount(<TestAccountMenu value={ctx} />);
      wrapper.find('.toggle-account-menu').simulate('click');
      expect(wrapper.find('.account-menu-open')).toHaveLength(1);
    });

    it('closes menu when toggle clicked', async () => {
      const listeners = {};
      document.addEventListener = jest.fn((event, cb) => {
        listeners[event] = cb;
      });

      const wrapper = mount(<div className="test-wrapper"><TestAccountMenu value={ctx} /></div>);
      wrapper.find('.toggle-account-menu').simulate('click'); // open
      act(() => {
        listeners.click({ target: wrapper.getDOMNode() }); // then close
      });

      await sleep(0);
      wrapper.update();

      expect(wrapper.find('.account-menu-open')).toHaveLength(0);
    });

    it('does\'t closes menu when menu clicked', async () => {
      const listeners = {};
      document.addEventListener = jest.fn((event, cb) => {
        listeners[event] = cb;
      });

      const wrapper = mount(<div className="test-wrapper"><TestAccountMenu value={ctx} /></div>);
      wrapper.find('.toggle-account-menu').simulate('click'); // open
      wrapper.find('.account-menu li').first().simulate('click');

      expect(wrapper.find('.account-menu-open')).toHaveLength(1);
    });
  });
});
