import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './Header';
import AppContext from '../../AppContext';

jest.mock('../TraderImg/TraderImg', () => (
  // eslint-disable-next-line func-names
  function MockTraderImg() {
    return <div />;
  }
));

jest.mock('./AccountMenu/AccountMenu', () => (
  // eslint-disable-next-line func-names
  function MockAccountMenu() {
    return <div />;
  }
));

let ctx;
const props = {};

beforeEach(() => {
  ctx = {
    auth: {
      login: sinon.stub(),
      register: sinon.stub(),
      logout: sinon.stub(),
    },
  };
});


// eslint-disable-next-line react/prop-types
function TestHeader({ value, ...obj }) {
  return (
    <Router><AppContext.Provider value={value}><Header {...obj} /></AppContext.Provider></Router>
  );
}

it('renders without logged in', () => {
  const el = mount(<TestHeader value={ctx} />);
  expect(el).toExist();
});

it('shows score when exists', async () => {
  props.score = 1200;
  const el = mount(<TestHeader value={ctx} {...props} />);
  expect(el.find('.score .value').text()).toEqual('1200');
});

it('shows rank when exists', async () => {
  props.rank = 12;
  const el = mount(<TestHeader value={ctx} {...props} />);
  expect(el.find('.rank .value').text()).toEqual('12');
});

it('passes profile photo to account menu', async () => {
  props.profilePhoto = 'test';
  const el = mount(<TestHeader value={ctx} {...props} />);
  expect(el.find('MockAccountMenu').prop('profilePhoto')).toEqual(props.profilePhoto);
});

it('passes user to account menu', async () => {
  props.user = { test: 1 };
  const el = mount(<TestHeader value={ctx} {...props} />);
  expect(el.find('MockAccountMenu').prop('user')).toEqual(props.user);
});
