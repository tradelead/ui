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

jest.mock('../LeaderDisplay/LeaderDisplay', () => ({
  __esModule: true,
  default: ({ traders, loading }) => (
    <div className="mockLeaderDisplay">
      {JSON.stringify({ traders, loading })}
    </div>
  ),
}));

const ctx = {
  traderScore: {
    subscribeToTopTraders: sinon.stub(),
  },
};

function setup() {
  return (
    <AppContext.Provider value={ctx}><Leaderboard /></AppContext.Provider>
  );
}

it('subscribes to 15 all time top traders', () => {
  const component = setup();
  mount(component);
  sinon.assert.calledWith(
    ctx.traderScore.subscribeToTopTraders,
    { limit: 15, period: undefined },
    sinon.match.any,
  );
});

it('subscribes to 15 weekly top traders', () => {
  const component = setup();
  mount(component);
  sinon.assert.calledWith(
    ctx.traderScore.subscribeToTopTraders,
    { period: 'week', limit: 15 },
    sinon.match.any,
  );
});

it('subscribes to 15 daily top traders', () => {
  const component = setup();
  mount(component);
  sinon.assert.calledWith(
    ctx.traderScore.subscribeToTopTraders,
    { period: 'day', limit: 15 },
    sinon.match.any,
  );
});

it('marks LeaderDisplay as loading until callback called', () => {
  let listener = null;
  ctx.traderScore.subscribeToTopTraders.callsFake((args, callback) => {
    // save all time callback
    if (!args.period) {
      listener = callback;
    }
    return () => {};
  });

  const component = setup();
  const wrapper = mount(component);

  let props;
  props = JSON.parse(wrapper.find('.mockColumnTab.All.Time .mockLeaderDisplay').text());
  expect(props.loading).toEqual(true);

  act(() => { listener([]); wrapper.update(); });

  props = JSON.parse(wrapper.find('.mockColumnTab.All.Time .mockLeaderDisplay').text());
  expect(props.loading).toEqual(false);
});

it('passes callback response to LeaderDisplay trader prop', () => {
  let listener = null;
  ctx.traderScore.subscribeToTopTraders.callsFake((args, callback) => {
    // save all time callback
    if (!args.period) {
      listener = callback;
    }
    return () => {};
  });

  const component = setup();
  const wrapper = mount(component);

  let props;
  props = JSON.parse(wrapper.find('.mockColumnTab.All.Time .mockLeaderDisplay').text());
  expect(props.traders).toEqual([]);

  act(() => { listener({ test: 1 }); wrapper.update(); });

  props = JSON.parse(wrapper.find('.mockColumnTab.All.Time .mockLeaderDisplay').text());
  expect(props.traders).toEqual({ test: 1 });
});
