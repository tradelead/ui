import React from 'react';
import { mount } from 'enzyme';
import AccountMenu from './AccountMenu';
import AppContext from '../../../AppContext';

let ctx;

beforeEach(() => {
  ctx = {
    auth: {},
    trader: {},
  };
});

it('Show Login and Sign Up when not logged in', () => {
  const el = mount(<AppContext.Provider value={ctx}><AccountMenu /></AppContext.Provider>);
  expect(el.find('button.login').text()).toEqual('Login');
  expect(el.find('button.logout').text()).toEqual('Sign Up');
});
