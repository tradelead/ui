import React from 'react';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { EventEmitter } from 'fbemitter';
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
    trader: Object.assign(new EventEmitter(), {
      getScore: sinon.stub(),
      getRank: sinon.stub(),
      get: sinon.stub(),
    }),
  };
});


// eslint-disable-next-line react/prop-types
function TestHeader({ value }) {
  return (
    <Router><AppContext.Provider value={value}><Header /></AppContext.Provider></Router>
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

it('renders without trader', () => {
  ctx.trader = {};
  const el = mount(<TestHeader value={ctx} />);
  expect(el).toExist();
});

describe('when trader exists', () => {
  beforeEach(() => {
    ctx.trader.id = 'trader123';
  });

  it('shows score when exists', async () => {
    ctx.trader.getScore.resolves(1200);
    const el = await mountAsync(<TestHeader value={ctx} />);
    expect(el.find('.score .value').text()).toEqual('1200');
  });

  it('updates score when trader newScore emitted', async () => {
    ctx.trader.getScore.resolves(1200);
    const el = await mountAsync(<TestHeader value={ctx} />);
    act(() => ctx.trader.emit('newScore', 1212));
    expect(el.find('.score .value').text()).toEqual('1212');
  });

  it('shows rank when exists', async () => {
    ctx.trader.getRank.resolves(12);
    const el = await mountAsync(<TestHeader value={ctx} />);
    expect(el.find('.rank .value').text()).toEqual('12');
  });

  it('updates rank when trader newRank emitted', async () => {
    ctx.trader.getRank.resolves(12);
    const el = await mountAsync(<TestHeader value={ctx} />);
    act(() => ctx.trader.emit('newRank', 24));
    expect(el.find('.rank .value').text()).toEqual('24');
  });
});
