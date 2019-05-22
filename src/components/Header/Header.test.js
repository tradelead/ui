import React from 'react';
import { act } from 'react-dom/test-utils';
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

let ctx;

beforeEach(() => {
  ctx = {
    auth: {
      login: sinon.stub(),
      register: sinon.stub(),
      logout: sinon.stub(),
    },
    trader: {
      observe: sinon.stub(),
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
  let observer = null;

  beforeEach(() => {
    ctx.trader.id = 'trader123';

    ctx.trader.observe.callsFake((args, callback) => {
      observer = callback;
      return () => {};
    });
  });

  it('shows score when exists', async () => {
    const el = await mountAsync(<TestHeader value={ctx} />);
    await act(async () => {
      observer({ score: 1200 });
      await sleep(0);
      el.update();
    });
    expect(el.find('.score .value').text()).toEqual('1200');
  });

  it('updates score when trader newScore emitted', async () => {
    const el = await mountAsync(<TestHeader value={ctx} />);
    await act(async () => {
      observer({ score: 1200 });
      await sleep(0);
      observer({ score: 1212 });
      await sleep(0);
      el.update();
    });
    expect(el.find('.score .value').text()).toEqual('1212');
  });

  it('shows rank when exists', async () => {
    const el = await mountAsync(<TestHeader value={ctx} />);
    await act(async () => {
      observer({ rank: 12 });
      await sleep(0);
      el.update();
    });
    expect(el.find('.rank .value').text()).toEqual('12');
  });

  it('updates rank when trader newRank emitted', async () => {
    const el = await mountAsync(<TestHeader value={ctx} />);
    await act(async () => {
      observer({ rank: 12 });
      await sleep(0);
      observer({ rank: 24 });
      await sleep(0);
      el.update();
    });
    expect(el.find('.rank .value').text()).toEqual('24');
  });
});
