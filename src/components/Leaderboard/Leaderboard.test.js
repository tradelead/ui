import React from 'react';
import sinon from 'sinon';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import Leaderboard from './Leaderboard';
import AppContext from '../../AppContext';

/* eslint-disable react/prop-types */
// shallow rendering is support with hooks yet
jest.mock('../ColumnsToTabs/ColumnsToTabs', () => ({
  __esModule: true,
  ColumnsToTabs: ({ children }) => <div className="mockColumnsToTabs">{children}</div>,
  ColumnTab: ({ children, label }) => <div className={`mockColumnTab ${label}`}>{children}</div>,
}));

jest.mock('../LeaderDisplay/LeaderDisplay', () => (
  // eslint-disable-next-line func-names
  function MockLeaderDisplay() {
    return <div />;
  }
));

const ctx = {
  traderService: {
    observeTopTraders: sinon.stub(),
  },
};

function setup({ props }) {
  return (
    <AppContext.Provider value={ctx}><Leaderboard {...props} /></AppContext.Provider>
  );
}

let props = {};

beforeEach(() => {
  props = {
    loading: false,
    allTimeTopTraders: [{
      id: 'test',
      username: 'testname',
      profilePhoto: { url: 'http://test.com/image.jpeg' },
      rank: 1,
      score: 1,
    }],
    weeklyTopTraders: [{
      id: 'test',
      username: 'testname',
      profilePhoto: { url: 'http://test.com/image.jpeg' },
      rank: 2,
      score: 2,
    }],
    dailyTopTraders: [{
      id: 'test',
      username: 'testname',
      profilePhoto: { url: 'http://test.com/image.jpeg' },
      rank: 3,
      score: 3,
    }],
  };
});

it('marks LeaderDisplays as loading', () => {
  props.loading = true;

  const component = setup({ props });
  const wrapper = mount(component);

  expect(wrapper.find('.mockColumnTab.All.Time MockLeaderDisplay'))
    .toHaveProp('loading', true);
  expect(wrapper.find('.mockColumnTab.Weekly MockLeaderDisplay'))
    .toHaveProp('loading', true);
  expect(wrapper.find('.mockColumnTab.Today MockLeaderDisplay'))
    .toHaveProp('loading', true);
});

it('passes all time traders to LeaderDisplay', () => {
  const component = setup({ props });
  const wrapper = mount(component);

  expect(wrapper.find('.mockColumnTab.All.Time MockLeaderDisplay'))
    .toHaveProp('traders', [{
      id: 'test',
      username: 'testname',
      profilePhoto: { url: 'http://test.com/image.jpeg' },
      rank: 1,
      score: 1,
    }]);
});

it('passes weekly traders to LeaderDisplay', () => {
  const component = setup({ props });
  const wrapper = mount(component);

  expect(wrapper.find('.mockColumnTab.Weekly MockLeaderDisplay'))
    .toHaveProp('traders', [{
      id: 'test',
      username: 'testname',
      profilePhoto: { url: 'http://test.com/image.jpeg' },
      rank: 2,
      score: 2,
    }]);
});

it('passes daily traders to LeaderDisplay', () => {
  const component = setup({ props });
  const wrapper = mount(component);

  expect(wrapper.find('.mockColumnTab.Today MockLeaderDisplay'))
    .toHaveProp('traders', [{
      id: 'test',
      username: 'testname',
      profilePhoto: { url: 'http://test.com/image.jpeg' },
      rank: 3,
      score: 3,
    }]);
});
