import React from 'react';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './Header';
import AppContext from '../../AppContext';

let ctx;

beforeEach(() => {
  ctx = {
    auth: {
      login: sinon.stub(),
      register: sinon.stub(),
      logout: sinon.stub(),
    },
    trader: {
      subscribeToScore: sinon.stub(),
      subscribeToRank: sinon.stub(),
      get: sinon.stub(),
    },
  };
});


// eslint-disable-next-line react/prop-types
function TestHeader({ value }) {
  return (
    <Router><AppContext.Provider value={value}><Header /></AppContext.Provider></Router>
  );
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function mountAsync(component) {
  let el;

  await act(async () => {
    el = mount(component);
  });

  el.update();

  return el;
}

it('renders without trader', () => {
  ctx.trader = {};
  const el = mount(<TestHeader value={ctx} />);
  expect(el).toExist();
});

describe('when trader exists', () => {
  let scoreListener = null;
  let rankListener = null;

  beforeEach(() => {
    ctx.trader.id = 'trader123';

    ctx.trader.subscribeToScore.callsFake((callback) => {
      scoreListener = callback;
      return () => {};
    });

    ctx.trader.subscribeToRank.callsFake((callback) => {
      rankListener = callback;
      return () => {};
    });
  });

  it('shows score when exists', async () => {
    const el = await mountAsync(<TestHeader value={ctx} />);
    await act(async () => {
      scoreListener(1200);
      await sleep(0);
      el.update();
    });
    expect(el.find('.score .value').text()).toEqual('1200');
  });

  it('updates score when trader newScore emitted', async () => {
    const el = await mountAsync(<TestHeader value={ctx} />);
    await act(async () => {
      scoreListener(1200);
      await sleep(0);
      scoreListener(1212);
      await sleep(0);
      el.update();
    });
    expect(el.find('.score .value').text()).toEqual('1212');
  });

  it('shows rank when exists', async () => {
    const el = await mountAsync(<TestHeader value={ctx} />);
    await act(async () => {
      rankListener(12);
      await sleep(0);
      el.update();
    });
    expect(el.find('.rank .value').text()).toEqual('12');
  });

  it('updates rank when trader newRank emitted', async () => {
    const el = await mountAsync(<TestHeader value={ctx} />);
    await act(async () => {
      rankListener(12);
      await sleep(0);
      rankListener(24);
      await sleep(0);
      el.update();
    });
    expect(el.find('.rank .value').text()).toEqual('24');
  });
});
