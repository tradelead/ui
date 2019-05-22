import React from 'react';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import sleep from '../../../utils/sleep';
import AccountMenu from './AccountMenu';
import AppContext from '../../../AppContext';

jest.mock('../../TraderImg/TraderImg', () => (
  // eslint-disable-next-line func-names
  function MockTraderImg() {
    return <div />;
  }
));

let ctx;

beforeEach(() => {
  ctx = {
    auth: {
      login: sinon.stub(),
      register: sinon.stub(),
      logout: sinon.stub(),
      settingsUrl: 'http://example.com/loginSettings',
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
    const port = window.location.port ? `:${window.location.port}` : '';
    const expectedUrl = `${window.location.protocol}//${window.location.host}${port}/account`;
    sinon.assert.calledWith(ctx.auth.register, expectedUrl);
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

  it('shows login settings link with url', () => {
    const wrapper = mount(<TestAccountMenu value={ctx} />);
    expect(wrapper.find('.loginSettings'))
      .toHaveProp('href', 'http://example.com/loginSettings');
  });

  it('calls auth logout when logout button clicked', () => {
    const wrapper = mount(<TestAccountMenu value={ctx} />);
    wrapper.find('button.logout').simulate('click');
    sinon.assert.called(ctx.auth.logout);
  });

  describe('profile photo', () => {
    it('shows trader\'s profile photo', async () => {
      const wrapper = await mountAsync(<TestAccountMenu value={ctx} />);

      expect(wrapper.find('MockTraderImg')).toHaveProp('trader', ctx.trader);
      expect(wrapper.find('MockTraderImg')).toHaveProp('size', 'thumbnail');
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
